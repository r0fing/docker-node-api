const express = require('express');
const mysql = require('mysql2');
const redis = require('redis');

const app = express();
const PORT = 3000;

const pool = mysql.createPool({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
});

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:6379`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect().catch(console.error);

app.get('/api/status', async (req, res) => {
    try {
        //STEP A: Check Redis first
        const cachedData = await redisClient.get('my_database_status');
        
        if (cachedData) {
            //CACHE HIT: Return immediately without querying the database
            return res.json({
                source: "Redis Cache Hit!",
                message: cachedData
            });
        }
        //STEP B: Cache Miss. Query from database
        pool.query('SELECT "Data pulled from hard drive!" AS db_status', async (error, results) => {
            if (error) throw error;
            
            const dbData = results[0].db_status
            
            //STEP C: Save the result to Redis for 60 seconds
            await redisClient.setEx('my_database_status', 60, dbData);
            
            res.json({
                source: "MariaDB Database Hit!",
                message: dbData
            });
        });
    } catch (error) {
        res.status(500).send(error_message);
    }
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
});

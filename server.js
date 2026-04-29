const express = require('express');
const mysql = require('mysql2');
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

app.get('/api/status', (req, res) => {
	pool.query('SELECT "Connected to MariaDB successfully!" AS db_status', (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                status: "Database connection failed",
                error: error.code
            });
        }
        res.json({ 
            message : "V3: Full Stack Application is Live!", status: "Healthy",
            database_test: results[0].db_status 
        });
    });
});

app.listen(PORT, () => {
	console.log('Server running on port ${PORT}')
});

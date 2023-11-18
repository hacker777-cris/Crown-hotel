const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Create a PostgreSQL pool
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'Hotels', // Replace with your database name
    password: 'sx033880', // Replace with your PostgreSQL password
    port: 5432, // Default PostgreSQL port
    // Set the search path to use the "hotelbooking" schema
    // Replace 'hotelbooking' with your schema name
    // If you have multiple schemas, specify them in the order you want PostgreSQL to search
    // For example: 'schema1, schema2, public' (public is the default schema)
    // The schemas are searched from left to right
    schema: 'hotelbooking',
});

// Test the PostgreSQL connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL!');
        release(); // Release the client back to the pool
    }
});

// Define API endpoint to get all customers
app.get('/api/customers', (req, res) => {
    pool.query('SELECT * FROM hotelbooking.customer', (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result.rows);
        }
    });
});

// Define API endpoint to get all rooms
app.get('/api/rooms', (req, res) => {
    pool.query('SELECT * FROM hotelbooking.room', (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result.rows);
        }
    });
});

// Define API endpoint to get all rates
app.get('/api/rates', (req, res) => {
    pool.query('SELECT * FROM hotelbooking.rates', (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result.rows);
        }
    });
});

// Define API endpoint to get all bookings
app.get('/api/bookings', (req, res) => {
    pool.query('SELECT * FROM hotelbooking.booking', (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result.rows);
        }
    });
});

// Define API endpoint to get all room bookings
app.get('/api/roombookings', (req, res) => {
    pool.query('SELECT * FROM hotelbooking.roombooking', (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(result.rows);
        }
    });
});





// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

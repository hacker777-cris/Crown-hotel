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


// Define API endpoint to insert a new booking record
app.post('/api/bookings', (req, res) => {
    const { b_ref, c_no, b_cost, b_outstanding, b_notes } = req.body;

    pool.query(
        `INSERT INTO hotelbooking.booking (b_ref, c_no, b_cost, b_outstanding, b_notes) 
        VALUES ($1, $2, $3, $4, $5)`,
        [b_ref, c_no, b_cost, b_outstanding, b_notes],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json({ message: 'New booking record inserted successfully' });
            }
        }
    );
});


//Make bookings

// ... (other code remains unchanged)

// Endpoint to create a new booking record
app.post('/api/bookings', (req, res) => {
    const { b_ref, c_no, b_cost, b_outstanding, b_notes } = req.body;

    // Validate incoming data
    if (!b_ref || !c_no || !b_cost || !b_outstanding) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate the format of numerical data
    if (isNaN(b_ref) || isNaN(c_no) || isNaN(b_cost) || isNaN(b_outstanding)) {
        return res.status(400).json({ error: 'Invalid data format for numeric fields' });
    }

    // Check other validations if necessary (e.g., existence of customer, format of notes)

     // Check if the customer exists
     pool.query('SELECT * FROM hotelbooking.customer WHERE c_no = $1', [c_no], (err, result) => {
        if (err) {
            console.error('Error checking customer:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (result.rows.length === 0) {
                // If customer doesn't exist, create a new customer
                pool.query(
                    `INSERT INTO hotelbooking.customer (c_no, c_name, c_email, c_address, c_cardtype, c_cardexp, c_cardno) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [c_no, req.body.c_name, req.body.c_email, req.body.c_address, req.body.c_cardtype, req.body.c_cardexp, req.body.c_cardno],
                    (err, result) => {
                        if (err) {
                            console.error('Error creating new customer:', err);
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }
                    }
                );
            }
            
            // Insert the room booking record
            pool.query(
                `INSERT INTO hotelbooking.roombooking (r_no, b_ref, checkin, checkout) 
                VALUES ($1, $2, $3, $4)`,
                [r_no, b_ref, checkin, checkout],
                (err, result) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        return res.json({ message: 'New room booking created successfully' });
                    }
                }
            )
            // Proceed to insert the booking record
            pool.query(
                `INSERT INTO hotelbooking.booking (b_ref, c_no, b_cost, b_outstanding, b_notes) 
                VALUES ($1, $2, $3, $4, $5)`,
                [b_ref, c_no, b_cost, b_outstanding, b_notes],
                (err, result) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        return res.json({ message: 'New booking record inserted successfully' });
                    }
                }
            );
        }
    });
});





// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

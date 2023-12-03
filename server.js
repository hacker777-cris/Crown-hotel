const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Middleware to parse JSON

// Create a PostgreSQL pool
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'localhost',
    database: 'hotels', // Replace with your database name
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
app.post('/api/bookRoom', (req, res) => {
    const { email, r_no, checkIn, checkOut, cost, outstanding, notes, customerData } = req.body;

    // Check if the customer exists based on the provided email
    pool.query('SELECT * FROM hotelbooking.customer WHERE c_email = $1', [email], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            if (result.rows.length > 0) {
                // Customer exists, proceed with booking
                const existingCustomer = result.rows[0];
                createBooking(existingCustomer.c_no);
            } else {
                // Customer does not exist, generate new c_no
                pool.query('SELECT MAX(c_no) FROM hotelbooking.customer', (err, maxResult) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        const maxCNo = maxResult.rows[0].max || 0; // Retrieve the maximum c_no
                        const newCNo = maxCNo + 1; // Generate the new c_no

                        // Insert the new customer with the generated c_no
                        pool.query(
                            'INSERT INTO hotelbooking.customer (c_no, c_name, c_email, c_address, c_cardtype, c_cardexp, c_cardno) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                            [newCNo, customerData.name, email, customerData.address, customerData.cardType, customerData.cardExp, customerData.cardNo],
                            (err, newCustomerResult) => {
                                if (err) {
                                    console.error('Error creating new customer:', err);
                                    res.status(500).json({ error: 'Internal Server Error' });
                                } else {
                                    createBooking(newCNo);
                                }
                            }
                        );
                    }
                });
            }
        }
    });


    // Function to create a new booking with generated b_ref
    function createBooking(customerId) {
        // Generate new b_ref
        pool.query('SELECT MAX(b_ref) FROM hotelbooking.booking', (err, maxBRefResult) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                const maxBRef = maxBRefResult.rows[0].max || 0; // Retrieve the maximum b_ref
                const newBRef = maxBRef + 1; // Generate the new b_ref

                // Insert into booking table with the generated b_ref
                pool.query(
                    'INSERT INTO hotelbooking.booking (b_ref, c_no, b_cost, b_outstanding, b_notes) VALUES ($1, $2, $3, $4, $5)',
                    [newBRef, customerId, cost, outstanding, notes],
                    (err, result) => {
                        if (err) {
                            console.error('Error creating booking:', err);
                            res.status(500).json({ error: 'Internal Server Error' });
                        } else {
                            // Inside the roombooking insertion block, after the room is booked successfully
                            pool.query(
                                'INSERT INTO hotelbooking.roombooking (r_no, b_ref, checkin, checkout) VALUES ($1, $2, $3, $4)',
                                [r_no, newBRef, checkIn, checkOut],
                                (err) => {
                                    if (err) {
                                        console.error('Error creating room booking:', err);
                                        res.status(500).json({ error: 'Internal Server Error' });
                                    } else {
                                        // Update room status to 'X' for unavailable
                                        pool.query(
                                            'UPDATE hotelbooking.room SET r_status = $1 WHERE r_no = $2',
                                            ['X', r_no],
                                            (err) => {
                                                if (err) {
                                                    console.error('Error updating room status:', err);
                                                    res.status(500).json({ error: 'Internal Server Error' });
                                                } else {
                                                    res.status(200).json({ message: 'Booking created successfully' });
                                                }
                                            }
                                        );
                                    }
                                }
                            );

                        }
                    }
                );
            }
        });
    }
});


// Endpoint to fetch booking details based on room number
app.post('/api/bookingDetails', (req, res) => {
    const { r_no } = req.body; // Assuming r_no is provided in the request body
  
    // Query to fetch booking details for a specific room number in the 'hotelbooking' schema
    const query = `
      SELECT * FROM hotelbooking.roombooking 
      JOIN hotelbooking.booking ON hotelbooking.roombooking.b_ref = hotelbooking.booking.b_ref
      WHERE hotelbooking.roombooking.r_no = $1
    `;
  
    pool.query(query, [r_no], (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        // Assuming you'll send back the booking details found for the room number
        const bookingDetails = result.rows; // Adjust as per your database schema
        res.status(200).json(bookingDetails);
      }
    });
  });
  

  app.put('/api/updateRoomStatus/:roomNumber', (req, res) => {
    const roomNumber = req.params.roomNumber;
    const newStatus = req.body.newStatus; // Assuming the new status is sent in the request body
  
    // Update the room status in the database
    const query = `
      UPDATE hotelbooking.room
      SET r_status = $1
      WHERE r_no = $2
    `;
  
    pool.query(query, [newStatus, roomNumber], (err, result) => {
      if (err) {
        console.error('Error updating room status:', err);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        res.status(200).json({ message: `Room ${roomNumber} status updated to ${newStatus}` });
      }
    });
  });
  

//Dashboard
app.get('/api/roomBookingsForCurrentWeek', async (req, res) => {
    try {
      const today = new Date();
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); // Start of current week (Sunday)
      const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay())); // End of current week (Saturday)
  
      const startOfWeekISOString = startOfWeek.toISOString();
      const endOfWeekISOString = endOfWeek.toISOString();
  
      const query = {
        text: `SELECT rb.r_no, rb.b_ref, rb.checkin, rb.checkout 
               FROM hotelbooking.roombooking rb 
               WHERE rb.checkin >= $1 AND rb.checkout <= $2`,
        values: [startOfWeekISOString, endOfWeekISOString],
      };
  
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching room bookings:', error);
      res.status(500).json({ error: 'An error occurred while fetching room bookings' });
    }
  });
 
  
// Endpoint to get rates by r_class
app.get('/api/rates/:r_class', async (req, res) => {
    const { r_class } = req.params;
  
    try {
      // Query to retrieve rate based on r_class from the rates table
      const query = 'SELECT * FROM hotelbooking.rates WHERE r_class = $1';
      const result = await pool.query(query, [r_class]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Rate not found' });
      }
  
      res.json(result.rows[0]); // Assuming there's only one rate per r_class
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



// Endpoint to get room details by room number
// Endpoint to get room details by room number
app.get('/api/roomDetails', async (req, res) => {
    try {
      const { r_no } = req.query;
  
      // Fetch room details based on room number from the 'room' table in the 'hotelbooking' schema
      const query = 'SELECT r_class FROM hotelbooking.room WHERE r_no = $1';
      const result = await pool.query(query, [r_no]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }
  
      const roomClass = result.rows[0].r_class;
  
      // Return room details including the room type
      res.json({ roomClass });
    } catch (error) {
      console.error('Error fetching room details:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

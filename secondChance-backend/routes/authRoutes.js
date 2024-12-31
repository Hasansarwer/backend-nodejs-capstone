const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');
const router = express.Router();
const dotenv = require('dotenv');
const pino = require('pino');  // Import Pino logger
const e = require('express');
dotenv.config();

const logger = pino();  // Create a Pino logger instance

//Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    try {
      //Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
      const db = await connectToDatabase();
      const collection = db.collection("users");
      const existingEmail = await collection.findOne({ email: req.body.email });

        if (existingEmail) {
            logger.error('Email id already exists');
            return res.status(400).json({ error: 'Email id already exists' });
        }

        const salt = await bcryptjs.genSalt(10);
        const hash = await bcryptjs.hash(req.body.password, salt);
        const email=req.body.email;
        const newUser = await collection.insertOne({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: hash,
            createdAt: new Date(),
        });

        const payload = {
            user: {
                id: newUser.insertedId,
            },
        };

        const authtoken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({ authtoken,email });
    } catch (e) {
        logger.error(e);
        return res.status(500).send('Internal server error');
    }
});

router.post('/login', async (req, res) => {
    try {
        // Task 1: Connect to `secondChance` in MongoDB through `connectToDatabase` in `db.js`.
        const db = await connectToDatabase();
        // Task 2: Access MongoDB `users` collection
        const collection = db.collection("users");
        // Task 3: Check for user credentials in database
        const user = await collection.findOne({ email: req.body.email });
        // Task 4: Check if the password matches the encrypted password and send appropriate message on mismatch
        if (user) {
            const result = await bcryptjs.compare(req.body.password, user.password);
            if (!result) {
                logger.error('Passwords do not match');
                return res.status(400).send('Wrong pasword');
            }
            // Task 5: Fetch user details from a database
            const userName = user.firstName;
            const userEmail = user.email;
            // Task 6: Create JWT authentication if passwords match with user._id as payload
            const payload = {
                user: {
                    id: user._id,
                },
            };
            const authtoken = jwt.sign(payload, JWT_SECRET);
            res.json({authtoken, userName, userEmail });
        }else{
            // Task 7: Send appropriate message if the user is not found
            logger.error('User not found');
            return res.status(400).send('User not found');
        }
    } catch (e) {
         return res.status(500).send('Internal server error');

    }
});

module.exports = router;
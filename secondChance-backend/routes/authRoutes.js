const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');
const { create } = require('domain');



router.post('/register', async (req, res, next) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection("users");
        const user = req.body;
        const existEmail = await collection.findOne({ email: user.email });

        if (existEmail) {
            logger.error('Email already exists');
            return res.status(400).json({ error: 'Email already exists' });
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password, salt);

        const newUser = await collection.insertOne({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            password: hash,
            created: new Date(),
        });

        const payload = {
            user: {
                id: newUser._id,
            }
        }

        const authToken = jwt.sign(payload, JWT_SECRET);
        logger.info('User registered successfully');
        res.json({ authToken, email: user.email });
    } catch (e) {
        logger.error('oops something went wrong', e)
        next(e);
    }
});
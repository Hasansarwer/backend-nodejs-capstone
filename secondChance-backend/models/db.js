require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection URL with authentication options
let url = `${process.env.MONGO_URL}`;

let dbInstance = null;
const dbName = `${process.env.MONGO_DB}`;

async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance; // Return existing instance if already connected
    }

    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        // Task 1: Connect to MongoDB
        await client.connect();
        console.log("Connected to MongoDB");

        // Task 2: Connect to database giftDB and store in variable dbInstance
        dbInstance = client.db(dbName);

        // Task 3: Return database instance
        return dbInstance;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error; // Re-throw the error for the calling function to handle
    }
}

module.exports = connectToDatabase;

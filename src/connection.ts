/* -------------------------
 * connection
 *
 * This module handles the connection to the PostgreSQL database. It uses
 * credentials that you supply in an .env file (see the README.md or index.js 
 * for details). Once connected, the pg module provides a pool of connections 
 * for the application to use efficiently
 * 
 * ------------------------- */

import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const { Pool } = pg;

// See the README.md or index.js for details
//    of how to connect to your SQL database
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: 'localhost',
  database: process.env.DB_NAME,
  port: 5432,
});

const connectToDb = async () => {
  try {
    console.log('Connecting to the database.');
    await pool.connect();
  } catch (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
};

const disconnectFromDb = async () => {
  try {
    pool.end();
    console.log('Disconnected from the database.');
  } catch (err) {
    console.error('Error disconnecting from database:', err);
  }
};

export { pool, connectToDb, disconnectFromDb };

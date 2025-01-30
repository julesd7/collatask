const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
require('dotenv').config();

const db = drizzle(process.env.DB_URL);

module.exports = { db };
require("dotenv").config();

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
});

pool.on("connect", () => {
  console.log("Connected to Local PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Database Error:", err);
});

module.exports = pool;
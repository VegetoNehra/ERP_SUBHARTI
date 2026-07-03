require("dotenv").config();

const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    console.log("CONNECTED");

    const result = await client.query("SELECT NOW()");

    console.log(result.rows);

  } catch (err) {

    console.error(err);

  } finally {

    await client.end();

  }
}

main();
const bcrypt = require("bcrypt");

console.log("Script started");

async function run() {
  try {
    console.log("Generating hash...");

    const hash = await bcrypt.hash("admin123", 10);

    console.log("Hash:");
    console.log(hash);
  } catch (err) {
    console.error(err);
  }
}

run();
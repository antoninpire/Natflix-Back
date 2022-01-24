const mysql = require("mysql");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = db;

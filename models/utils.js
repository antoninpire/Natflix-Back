const db = require("../config/db");

async function asyncQuery(query, args = []) {
  return new Promise((resolve, reject) => {
    db.query(query, args, (err, res) => {
      if (err) reject(err);
      if (query.includes("INSERT") && res) resolve(res.insertId);
      resolve(res);
    });
  });
}

module.exports = asyncQuery;

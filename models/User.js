const db = require("../config/db");
const bcrypt = require("bcrypt");
const asyncQuery = require("./utils");

const User = function (user) {
  this.username = user.identifiant;
  this.password = user.password;
};

User.hashPassword = function (pass) {
  return bcrypt.hashSync(pass, bcrypt.genSaltSync(8), null);
};

User.verifPassword = function (pass, sPass) {
  return bcrypt.compareSync(pass, sPass);
};

User.exists = function (username) {
  db.query(
    "SELECT * FROM utilisateurs WHERE identifiant=?",
    [username],
    function (err, res) {
      if (err) return callback(err);
      if (!res.length) return callback(null, 0, res);
      return callback(null, 1, res);
      // return callback(null, 2, res);
    }
  );
};

User.createUser = function (user) {
  return asyncQuery(
    "INSERT INTO utilisateurs (identifiant, password) VALUES (?, ?)",
    [user.username, User.hashPassword(user.password)]
  );
};

User.getUserById = function (id) {
  return asyncQuery("SELECT * FROM utilisateurs WHERE id=?", [id]);
};

User.login = function (username, pass, callback) {
  db.query(
    "SELECT * FROM utilisateurs WHERE identifiant=?",
    username,
    function (err, res) {
      if (err) return callback(err);
      if (!res.length) return callback(null, 0);
      if (!User.verifPassword(pass, res[0].password)) return callback(null, 1);
      return callback(null, 2, res[0]);
    }
  );
};

User.empty = async function () {
  return asyncQuery("DELETE FROM utilisateurs");
};

module.exports.User = User;

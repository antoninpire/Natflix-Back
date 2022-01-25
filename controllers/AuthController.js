const { User } = require("../models/User");
const jwt = require("jsonwebtoken");

exports.signUp = async function (req, res, next) {
  const data = req.body;
  if (!data.username || !data.password)
    return res.status(403).send("Missing parameters");
  User.exists(data.username, async function (err, status, result) {
    if (err) return res.status(500).send(err);
    switch (status) {
      case 1:
        return res.status(403).send("Le nom d'utilisateur est déjà pris!");
    }
    return res.json(await User.createUser(data));
  });
};

exports.login = async function (req, res, next) {
  const data = req.body;
  if (!data.username || !data.password)
    return res.status(403).send("Missing parameters");
  User.login(data.username, data.password, function (err, status, user) {
    if (err) return res.status(500).send(err);
    switch (status) {
      case 0:
        return res.status(403).send("L'identifiant n'existe pas!");
      case 1:
        return res.status(403).send("Le mot de passe ne correspond pas");
      default:
        const token = jwt.sign(
          { userId: user.id, userType: user.type },
          "RANDOM_TOKEN_SECRET"
        );
        return res.json({
          user,
          token,
        });
    }
  });
};

exports.getUsers = async function (req, res, next) {
  User.getUsers(function (err, users) {
    if (err) return res.status(500).send(err);
    return res.json(users);
  });
};

exports.getUserById = async function (req, res, next) {
  User.getUserById(req.params.id, function (err, result) {
    if (err) return res.status(500).send(err);
    if (!result.length) return res.status(404).send("User not found");
    return res.json(result[0]);
  });
};

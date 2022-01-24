const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    if (
      decodedToken.userType != "ADMIN" &&
      req.body.id_user &&
      req.body.id_user != decodedToken.userId
    )
      return res.status(401).send("Invalid request");
    if (
      decodedToken.userType != "ADMIN" &&
      req.params.id_user &&
      req.params.id_user != decodedToken.userId
    )
      return res.status(401).send("Invalid request");
    next();
  } catch (err) {
    return res.status(401).send("Invalid request");
  }
};

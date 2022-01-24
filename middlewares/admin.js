const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
    const userType = decodedToken.userType;
    // if (!req.body.userId || req.body.userId != userId || userType != 'ADMIN') return res.status(401).send('Invalid user id');
    // else next();
    if (userType != "ADMIN") return res.status(401).send("Invalid request");
    next();
  } catch {
    return res.status(401).send("Invalid request");
  }
};

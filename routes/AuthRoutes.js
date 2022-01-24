const express = require("express");
const router = express.Router();
const auth = require("./../middlewares/auth");
// const admin = require("./../middlewares/admin");
const AuthController = require("../controllers/AuthController");

router.post("/signup", AuthController.signUp);
router.post("/login", AuthController.login);
// router.get("/", admin, AuthController.getUsers);
router.get("/:id", auth, AuthController.getUserById);

module.exports = router;

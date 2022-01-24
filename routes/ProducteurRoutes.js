const express = require("express");
const router = express.Router();
const auth = require("./../middlewares/auth");
const ProducteurController = require("../controllers/ProducteurController");

router.get("/distinct", auth, ProducteurController.getDistinctProducteurs);

module.exports = router;

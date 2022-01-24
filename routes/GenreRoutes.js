const express = require("express");
const router = express.Router();
const auth = require("./../middlewares/auth");
const GenreController = require("../controllers/GenreController");

router.get("/distinct", auth, GenreController.getDistinctGenres);

module.exports = router;

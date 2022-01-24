const express = require("express");
const router = express.Router();
// const auth = require("./../middlewares/auth");
const DataController = require("../controllers/DataController");

router.post("/populate", DataController.populate);
module.exports = router;

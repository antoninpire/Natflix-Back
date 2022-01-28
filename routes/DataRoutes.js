const express = require("express");
const router = express.Router();
// const auth = require("./../middlewares/auth");
const DataController = require("../controllers/DataController");

router.post("/populate", DataController.populate);
router.delete("/duplicates", DataController.removeMovieDuplicates);

module.exports = router;

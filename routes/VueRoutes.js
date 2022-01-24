const express = require("express");
const router = express.Router();
const auth = require("./../middlewares/auth");
const VueController = require("../controllers/VueController");

router.get("/filmAndUser", auth, VueController.getVueFilmUtilisateur);
router.post("/toggle", auth, VueController.toggleVue);

module.exports = router;

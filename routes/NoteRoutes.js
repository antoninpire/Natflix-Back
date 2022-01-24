const express = require("express");
const router = express.Router();
const auth = require("./../middlewares/auth");
const NoteController = require("../controllers/NoteController");

router.get("/filmAndUser", auth, NoteController.getNoteFilmUtilisateur);
router.post("/add", auth, NoteController.createNote);

module.exports = router;

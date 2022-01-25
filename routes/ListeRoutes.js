const express = require("express");
const router = express.Router();
const auth = require("./../middlewares/auth");
const ListeController = require("../controllers/ListeController");

router.get("/get/:id_user", auth, ListeController.getListesUtilisateur);
router.get(
  "/getWithoutMovies/:id_user",
  auth,
  ListeController.getListesUtilisateurSansFilms
);
router.delete("/:id", auth, ListeController.deleteListe);
router.post("/add", ListeController.createListe);
router.post("/update", ListeController.update);
router.put("/:id", ListeController.updateListe);

module.exports = router;

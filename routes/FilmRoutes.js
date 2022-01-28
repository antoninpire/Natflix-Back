const express = require("express");
const router = express.Router();
const auth = require("./../middlewares/auth");
const FilmController = require("../controllers/FilmController");

router.get("/get/:id", auth, FilmController.getFilm);
router.get("/all", auth, FilmController.getFilms);
router.get("/popular", auth, FilmController.getFilmsPopulaires);
router.get("/seen/:id_user", auth, FilmController.getFilmsVus);
router.get("/rated/:id_user", auth, FilmController.getFilmsNotes);
router.get("/similar/:id", auth, FilmController.getFilmsSimilaires);
router.get(
  "/searchAutocomplete",
  auth,
  FilmController.getSearchAutoCompleteData
);
router.get("/recommandations", auth, FilmController.getRecommandations);
router.get("/genre", auth, FilmController.getFilmsGenre);
router.get("/producteur", auth, FilmController.getFilmsProducteur);

module.exports = router;

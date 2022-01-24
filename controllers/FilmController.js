const { Film } = require("../models/Film");

// Populaires
// Recommandations
// Tous les films

exports.getFilm = async function (req, res, next) {
  if (!req.params.id) return res.status(403).send("Missing parameters");
  return res.json(await Film.getFilm(req.params.id));
};

exports.getFilms = async function (req, res, next) {
  return res.json(await Film.getFilms());
};

exports.getFilmsPopulaires = async function (req, res, next) {
  return res.json(await Film.getFilmsPopulaires());
};

exports.getFilmsVus = async function (req, res, next) {
  if (!req.params.id_user) return res.status(403).send("Missing parameters");
  return res.json(await Film.getFilmsVus(req.params.id_user));
};

exports.getFilmsSimilaires = async function (req, res, next) {
  if (!req.params.id) return res.status(403).send("Missing parameters");
  Film.getFilm(req.params.id)
    .then(async (r) => {
      const movie = r[0];
      movie.nom_genres = movie.nom_genres.split(",");
      movie.nom_producteurs = movie.nom_producteurs.split(",");

      // On calcule le nombre de correspondances genres ou producteurs pour une similarité à 80%
      const nGenres = Math.round(movie.nom_genres.length * 0.8);
      const nProducteurs = Math.round(movie.nom_producteurs.length * 0.8);

      return res.json(
        await Film.getFilmsSimilaires(movie, nGenres, nProducteurs)
      );
    })
    .catch((err) => {
      console.log("err", err);
      return res.status(500).send(err);
    });
};

exports.getSearchAutoCompleteData = async function (req, res, next) {
  return res.json([
    ...(await Film.getSearchAutoCompleteData()),
    ...(await Film.getSearchAutoCompleteDataProducers()),
  ]);
};

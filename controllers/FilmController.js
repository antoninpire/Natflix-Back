const { Film } = require("../models/Film");
const { Note } = require("../models/Note");

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

exports.getRecommandations = async function (req, res, next) {
  if (!req.query.filtering || (req.query.filtering == 3 && !req.query.id_user))
    return res.status(403).send("Missing parameters");
  // Si notes du user > 5
  // Si filtering == 1 ou == 2 alors récupérer 5 films les mieux notés order by date_creation -> 6 recommandations par film
  // Si filtering == 3 juste renvoyer 30 recommandations pour le user

  // Si notes du user < 5
  // Renvoyer films bien notés (avg > 3.5)
  const notes = await Note.getNotesUtilisateur(req.query.id_user);
  let recommandationsIds = [];
  if (notes.length >= 5) {
    if (req.query.filtering == 1 || req.query.filtering == 2) {
      const favMovies = await Note.getNFavoriteMoviesFromUser(
        req.query.id_user,
        5
      );
      for (let { id_film } of favMovies) {
        recommandationsIds = recommandationsIds.concat(
          await Film.getRecommandations(
            req.query.filtering,
            req.query.id_user,
            id_film,
            (1 / favMovies.length) * 30
          )
        );
      }
    } else {
      recommandationsIds = await Film.getRecommandations(
        req.query.filtering,
        req.query.id_user,
        null,
        30
      );
    }
  }
  console.log(recommandationsIds);
  return res.json(await Film.getFilmsListe(recommandationsIds));
};

exports.getFilmsPopulaires = async function (req, res, next) {
  return res.json(await Film.getFilmsPopulaires());
};

exports.getFilmsVus = async function (req, res, next) {
  if (!req.params.id_user) return res.status(403).send("Missing parameters");
  return res.json(await Film.getFilmsVus(req.params.id_user));
};

exports.getFilmsNotes = async function (req, res, next) {
  if (!req.params.id_user) return res.status(403).send("Missing parameters");
  return res.json(await Film.getFilmsNotes(req.params.id_user));
};

exports.getFilmsSimilaires = async function (req, res, next) {
  if (!req.params.id) return res.status(403).send("Missing parameters");
  /* Film.getFilm(req.params.id)
    .then(async (r) => {
      const movie = r[0];
      movie.nom_genres = movie.nom_genres ? movie.nom_genres.split(",") : [];
      movie.nom_producteurs = movie.nom_producteurs
        ? movie.nom_producteurs.split(",")
        : [];

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
    }); */
  const movie_ids = await Film.getFilmsSimilaires(req.params);
  return res.json(await Film.getFilmsListe(movie_ids));
};

exports.getSearchAutoCompleteData = async function (req, res, next) {
  return res.json([
    ...(await Film.getSearchAutoCompleteData()),
    ...(await Film.getSearchAutoCompleteDataProducers()),
  ]);
};

exports.getFilmsGenre = async function (req, res, next) {
  if (!req.query.genre) return res.status(403).send("Missing parameters");
  return res.json(await Film.getFilmsGenre(req.query.genre));
};

exports.getFilmsProducteur = async function (req, res, next) {
  if (!req.query.producteur) return res.status(403).send("Missing parameters");
  return res.json(await Film.getFilmsProducteur(req.query.producteur));
};

const { Liste } = require("../models/Liste");
const { ListeFilm } = require("../models/ListeFilm");
const { Film } = require("../models/Film");

exports.getListesUtilisateur = async function (req, res, next) {
  if (!req.params.id_user) return res.status(403).send("Missing parameters");
  Liste.getListesUtilisateur(req.params.id_user)
    .then(async (listes) => {
      if (listes.length == 1 && !listes[0].id) return res.json([]);
      const ret = [];
      for (let liste of listes) {
        const films = liste.films_ids
          ? await Film.getFilmsListe(liste.films_ids.split(","))
          : [];
        ret.push({
          ...liste,
          films,
        });
      }
      return res.json(ret);
    })
    .catch((err) => {
      console.log("err", err);
      return res.status(500).send(err);
    });
};

exports.getListesUtilisateurSansFilms = async function (req, res, next) {
  if (!req.params.id_user) return res.status(403).send("Missing parameters");
  return res.json(await Liste.getListesUtilisateur(req.params.id_user));
};

exports.deleteListe = async function (req, res, next) {
  if (!req.params.id) return res.status(403).send("Missing parameters");
  return ListeFilm.deleteListe(req.params.id).then(async (r) => {
    return res.json(await Liste.deleteListe(req.params.id));
  });
};

exports.createListe = async function (req, res, next) {
  if (!req.body.id_utilisateur || !req.body.nom)
    return res.status(403).send("Missing parameters");
  return res.json(await Liste.createListe(req.body));
};

exports.addMovieToList = async function (req, res, next) {
  if (!req.body.id_liste || !req.body.id_film)
    return res.status(403).send("Missing parameters");
  return res.json(
    await ListeFilm.addMovieToList(req.body.id_liste, req.body.id_film)
  );
};

exports.deleteMovieFromList = async function (req, res, next) {
  if (!req.body.id_liste || !req.body.id_film)
    return res.status(403).send("Missing parameters");
  return res.json(
    await ListeFilm.deleteMovieFromList(req.body.id_liste, req.body.id_film)
  );
};

exports.update = async function (req, res, next) {
  if (!req.body.id_utilisateur || !req.body.id_film || !req.body.lists_ids)
    return res.status(403).send("Missing parameters");
  ListeFilm.deleteMovieFromUserLists(req.body.id_film, req.body.id_utilisateur)
    .then(async (r) => {
      for (let id_liste of req.body.lists_ids) {
        await ListeFilm.addMovieToList(id_liste, req.body.id_film);
      }
      return res.json("OK");
    })
    .catch((err) => {
      console.log("err", err);
      return res.status(500).send(err);
    });
};

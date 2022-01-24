const { Vue } = require("../models/Vue");

exports.getVueFilmUtilisateur = async function (req, res, next) {
  if (!req.query.id_film || !req.query.id_utilisateur)
    return res.status(403).send("Missing parameters");
  return res.json(
    await Vue.getVueFilmUtilisateur(req.query.id_film, req.query.id_utilisateur)
  );
};

exports.toggleVue = async function (req, res, next) {
  if (!req.body.id_film || !req.body.id_utilisateur)
    return res.status(403).send("Missing parameters");
  return res.json(
    await Vue.toggleVue(req.body.id_film, req.body.id_utilisateur)
  );
};

const { Note } = require("../models/Note");

exports.getNoteFilmUtilisateur = async function (req, res, next) {
  if (!req.query.id_film || !req.query.id_utilisateur)
    return res.status(403).send("Missing parameters");
  return res.json(
    await Note.getNoteFilmUtilisateur(
      req.query.id_film,
      req.query.id_utilisateur
    )
  );
};

exports.createNote = async function (req, res, next) {
  if (!req.body.id_film || !req.body.id_utilisateur || !req.body.note)
    return res.status(403).send("Missing parameters");
  Note.exists(req.body.id_film, req.body.id_utilisateur)
    .then(async (r) => {
      if (!r.length) return res.json(await Note.createNote(req.body));
      return res.json(await Note.update({ note: req.body.note, id: r[0].id }));
    })
    .catch((err) => {
      console.log("err", err);
      return res.status(500).send(err);
    });
};

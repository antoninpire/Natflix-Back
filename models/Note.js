const asyncQuery = require("./utils");

const Note = function (note) {
  this.id_film = note.id_film;
  this.id_utilisateur = note.id_utilisateur;
  this.note = note.note;
};

Note.createNote = async function (note) {
  return asyncQuery(
    "INSERT INTO notes (id_film, id_utilisateur, note) VALUES (?, ?, ?)",
    [note.id_film, note.id_utilisateur, note.note]
  );
};

Note.exists = async function (id_film, id_utilisateur) {
  return asyncQuery(
    "SELECT * FROM notes WHERE id_film=? AND id_utilisateur=?",
    [id_film, id_utilisateur]
  );
};

Note.update = async function (note) {
  return asyncQuery("UPDATE notes SET note=? WHERE id=?", [note.note, note.id]);
};

Note.empty = async function () {
  return asyncQuery("DELETE FROM notes");
};

Note.getNoteFilmUtilisateur = async function (id_film, id_utilisateur) {
  return asyncQuery(
    "SELECT * FROM notes WHERE id_film=? AND id_utilisateur=?",
    [id_film, id_utilisateur]
  );
};

Note.getNotesUtilisateur = async function (id_utilisateur) {
  return asyncQuery("SELECT * FROM notes WHERE id_utilisateur=?", [
    id_utilisateur,
  ]);
};

Note.getNFavoriteMoviesFromUser = async function (id_utilisateur, n) {
  return asyncQuery(
    "SELECT id_film FROM `notes` where id_utilisateur=? ORDER BY note DESC, date_creation DESC LIMIT ?;",
    [id_utilisateur, n]
  );
};

Note.deleteNotesFilm = async function (id_film) {
  return asyncQuery("DELETE FROM notes WHERE id_film=?", [id_film]);
};

module.exports.Note = Note;

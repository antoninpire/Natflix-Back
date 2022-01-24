const asyncQuery = require("./utils");

const ListeFilm = function (listeFilm) {
  this.id_liste = listeFilm.id_liste;
  this.id_film = listeFilm.id_film;
};

ListeFilm.createListeFilm = function (listeFilm) {
  return asyncQuery(
    "INSERT INTO liste_film (id_liste, id_film) VALUES (?, ?)",
    [listeFilm.id_liste, listeFilm.id_film]
  );
};

ListeFilm.deleteListe = function (id_liste) {
  return asyncQuery("DELETE FROM liste_film WHERE id_liste=?", [id_liste]);
};

ListeFilm.empty = function () {
  return asyncQuery("DELETE FROM liste_film");
};

ListeFilm.addMovieToList = function (id_liste, id_film) {
  return asyncQuery(
    "INSERT INTO liste_film (id_liste, id_film) VALUES (?, ?)",
    [id_liste, id_film]
  );
};

ListeFilm.deleteMovieFromList = function (id_liste, id_film) {
  return asyncQuery("DELETE FROM liste_film WHERE id_liste=? AND id_film=?", [
    id_liste,
    id_film,
  ]);
};

ListeFilm.deleteMovieFromUserLists = function (id_film, id_utilisateur) {
  return asyncQuery(
    "DELETE FROM liste_film WHERE id_film=? AND id_liste IN (SELECT id FROM listes WHERE id_utilisateur=?)",
    [id_film, id_utilisateur]
  );
};

module.exports.ListeFilm = ListeFilm;

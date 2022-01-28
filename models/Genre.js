const asyncQuery = require("./utils");

const Genre = function (genre) {
  this.id_film = genre.id_film;
  this.nom = genre.nom;
};

Genre.createGenre = async function (genre) {
  return asyncQuery("INSERT INTO genres (id_film, nom) VALUES (?, ?)", [
    genre.id_film,
    genre.nom,
  ]);
};

Genre.empty = async function () {
  return asyncQuery("DELETE FROM genres");
};

Genre.getDistinctGenres = async function () {
  return asyncQuery("SELECT DISTINCT(nom) FROM genres");
};

Genre.deleteGenresFilm = async function (id_film) {
  return asyncQuery("DELETE FROM genres WHERE id_film=?", [id_film]);
};

module.exports.Genre = Genre;

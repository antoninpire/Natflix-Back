const asyncQuery = require("./utils");

const Producteur = function (producteur) {
  this.id_film = producteur.id_film;
  this.nom = producteur.nom;
  this.pays = producteur.pays;
};

Producteur.createProducteur = async function (producteur) {
  return asyncQuery(
    "INSERT INTO producteurs (id_film, nom, pays) VALUES (?, ?, ?)",
    [producteur.id_film, producteur.nom, producteur.pays]
  );
};

Producteur.empty = async function () {
  return asyncQuery("DELETE FROM producteurs");
};

Producteur.getDistinctProducteurs = async function () {
  return asyncQuery(
    "SELECT DISTINCT(nom) FROM `producteurs` GROUP BY nom HAVING COUNT(id_film) > 5;"
  );
};

Producteur.deleteProducteursFilm = async function (id_film) {
  return asyncQuery("DELETE FROM producteurs WHERE id_film=?", [id_film]);
};

module.exports.Producteur = Producteur;

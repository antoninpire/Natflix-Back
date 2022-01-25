const asyncQuery = require("./utils");

const Liste = function (liste) {
  this.nom = liste.nom;
  this.id_utilisateur = liste.id_utilisateur;
};

Liste.createListe = function (liste) {
  return asyncQuery("INSERT INTO listes (nom, id_utilisateur) VALUES (?, ?)", [
    liste.nom,
    liste.id_utilisateur,
  ]);
};

Liste.deleteListe = function (id) {
  return asyncQuery("DELETE FROM listes WHERE id=?", [id]);
};

Liste.updateListe = function (liste) {
  return asyncQuery(`UPDATE listes SET nom=? WHERE id=?`, [
    liste.nom,
    liste.id,
  ]);
};

Liste.getListesUtilisateur = function (id_utilisateur) {
  return asyncQuery(
    `SELECT
        l.id, l.nom, l.date_creation,
        GROUP_CONCAT(DISTINCT lf.id_film) AS films_ids
        FROM listes l
        LEFT JOIN liste_film lf ON l.id=lf.id_liste
        WHERE l.id_utilisateur=?
        GROUP BY l.id
        `,
    [id_utilisateur]
  );
};

Liste.empty = function () {
  return asyncQuery("DELETE FROM listes");
};

module.exports.Liste = Liste;

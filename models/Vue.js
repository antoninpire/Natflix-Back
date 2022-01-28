const asyncQuery = require("./utils");

const Vue = function (vue) {
  this.id_film = vue.id_film;
  this.id_utilisateur = vue.id_utilisateur;
  this.horodatage = vue.horodatage;
};

Vue.createVue = function (vue) {
  return asyncQuery(
    "INSERT INTO vues (id_film, id_utilisateur, horodatage) VALUES (?, ?, ?)",
    [vue.id_film, vue.id_utilisateur, vue.horodatage]
  );
};

Vue.empty = async function () {
  return asyncQuery("DELETE FROM vues");
};

Vue.getVueFilmUtilisateur = function (id_film, id_utilisateur) {
  return asyncQuery("SELECT * FROM vues WHERE id_film=? AND id_utilisateur=?", [
    id_film,
    id_utilisateur,
  ]);
};

Vue.deleteVueFilmUtilisateur = async function (id_film, id_utilisateur) {
  return asyncQuery("DELETE FROM vues WHERE id_film=? AND id_utilisateur=?", [
    id_film,
    id_utilisateur,
  ]);
};

Vue.toggleVue = async function (id_film, id_utilisateur) {
  const views = await this.getVueFilmUtilisateur(id_film, id_utilisateur);
  if (!views.length) {
    return await this.createVue({
      id_film,
      id_utilisateur,
      horodatage: 0,
    });
  }
  return await this.deleteVueFilmUtilisateur(id_film, id_utilisateur);
};

Vue.deleteVuesFilm = async function (id_film) {
  return asyncQuery("DELETE FROM vues WHERE id_film=?", [id_film]);
};

module.exports.Vue = Vue;

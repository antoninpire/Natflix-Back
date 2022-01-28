const asyncQuery = require("./utils");
const { spawn } = require("child_process");

const Film = function (film) {
  this.titre = film.titre;
  this.description = film.description;
  this.duree = film.duree;
  this.date_diffusion = film.date_diffusion;
  this.url_affiche = film.url_affiche;
  this.url_image = film.url_image;
};

Film.createFilm = async function (film) {
  if (film.id)
    return asyncQuery(
      "INSERT INTO films (id, titre, description, duree, date_diffusion, url_affiche, url_image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        film.id,
        film.titre,
        film.description,
        film.duree,
        film.date_diffusion,
        film.url_affiche,
        film.url_image,
      ]
    );
  return asyncQuery(
    "INSERT INTO films (titre, description, duree, date_diffusion, url_affiche, url_image) VALUES (?, ?, ?, ?, ?, ?)",
    [
      film.titre,
      film.description,
      film.duree,
      film.date_diffusion,
      film.url_affiche,
      film.url_image,
    ]
  );
};

Film.empty = async function () {
  return asyncQuery("DELETE FROM films");
};

Film.getFilm = function (id) {
  return asyncQuery(
    `SELECT 
    f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation, 
    GROUP_CONCAT(DISTINCT g.nom) AS nom_genres, 
    GROUP_CONCAT(DISTINCT p.nom) AS nom_producteurs, 
    (SELECT COUNT(id) FROM vues WHERE id_film=?) AS nb_vues,
    (SELECT COUNT(id) FROM notes WHERE id_film=?) AS nb_notes, 
    (SELECT ROUND(AVG(note), 2) FROM notes WHERE id_film=?) AS moyenne 
    FROM films f 
    LEFT JOIN genres g ON f.id=g.id_film 
    LEFT JOIN producteurs p ON f.id=p.id_film 
    where f.id=?;`,
    [id, id, id, id]
  );
};

Film.getFilmsListe = async function (ids) {
  return asyncQuery(
    `SELECT 
    f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation, 
    GROUP_CONCAT(DISTINCT g.nom) AS nom_genres, 
    GROUP_CONCAT(DISTINCT p.nom) AS nom_producteurs 
    FROM films f 
    LEFT JOIN genres g ON f.id=g.id_film 
    LEFT JOIN producteurs p ON f.id=p.id_film
    WHERE f.id IN (?)
    GROUP BY f.id;`,
    [ids]
  );
};

Film.getFilms = function () {
  return asyncQuery(`SELECT 
  f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation, 
  GROUP_CONCAT(DISTINCT g.nom) AS nom_genres, 
  GROUP_CONCAT(DISTINCT p.nom) AS nom_producteurs 
  FROM films f 
  LEFT JOIN genres g ON f.id=g.id_film 
  LEFT JOIN producteurs p ON f.id=p.id_film 
  GROUP BY f.id;`);
};

Film.getRecommandations = async function (
  filtering = 1,
  id_user = null,
  id_film = null,
  n_recommandations = 5
) {
  let dataToSend;
  const python = spawn("python", [
    "main.py",
    filtering,
    filtering == 3 ? id_user : id_film,
    n_recommandations,
  ]);

  return new Promise((resolve, reject) => {
    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend = data.toString();
    });
    python.on("close", (code) => {
      if (code != 0 && code != 1) reject("Il y a une erreur");
      if (dataToSend) resolve(JSON.parse(dataToSend));
    });
  });
};

Film.getFilmsPopulaires = function () {
  return asyncQuery(
    `
        SELECT 
        f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation, 
        vues.nb_vues 
        FROM films f 
        LEFT JOIN 
        (SELECT id_film, COUNT(*) AS nb_vues FROM vues GROUP BY id_film ORDER BY nb_vues DESC LIMIT 30) vues 
        ON f.id=vues.id_film 
        WHERE vues.nb_vues IS NOT NULL 
        GROUP BY f.id;
        `
  );
};

Film.getFilmsVus = function (id_user) {
  return asyncQuery(
    `SELECT 
    f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation
    FROM films f 
    LEFT JOIN vues v ON f.id=v.id_film 
    WHERE v.id_utilisateur=?
    GROUP BY f.id 
    ORDER BY v.date_creation DESC 
    LIMIT 30;
  `,
    [id_user]
  );
};

Film.getFilmsSimilaires = async function (movie /*, nGenres, nProducteurs */) {
  /* return asyncQuery(
    `
    SELECT 
    f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation
    FROM films f 
    LEFT JOIN genres g ON f.id=g.id_film AND g.nom IN (?)
    LEFT JOIN producteurs p ON f.id=p.id_film AND p.nom IN (?)
    WHERE f.id != ?
    GROUP BY f.id
    HAVING COUNT(DISTINCT g.id) >= ? OR COUNT(DISTINCT p.id) >= ?
    LIMIT 18;`,
    [movie.nom_genres, movie.nom_producteurs, movie.id, nGenres, nProducteurs]
  ); */

  let dataToSend;
  const python = spawn("python", ["main.py", 1, movie.id, 30]);

  return new Promise((resolve, reject) => {
    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend = data.toString();
    });
    python.on("close", (code) => {
      if (code != 0 && code != 1) reject("Il y a une erreur");
      console.log(dataToSend);
      if (dataToSend) resolve(JSON.parse(dataToSend));
    });
  });
};

Film.getSearchAutoCompleteData = function () {
  return asyncQuery(
    `
    SELECT CONCAT(titre, " (",YEAR(date_diffusion), ")") AS val, id, "Film" AS type 
    FROM films
    UNION 
    SELECT DISTINCT(nom) AS val, id, "Genre" AS type 
    FROM genres 
    GROUP BY nom;
    `
  );
};

Film.getSearchAutoCompleteDataProducers = function () {
  return asyncQuery(
    `
    SELECT DISTINCT(nom) AS val, id, "Producteur" AS type
    FROM producteurs 
    GROUP BY nom 
    ORDER BY COUNT(DISTINCT id_film) DESC 
    LIMIT 30;

    `
  );
};

Film.getFilmsNotes = function (id_utilisateur) {
  return asyncQuery(
    `
    SELECT 
    f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation
    FROM films f 
    LEFT JOIN notes n ON f.id=n.id_film 
    WHERE n.id_utilisateur=?
    GROUP BY f.id 
    ORDER BY n.date_creation DESC 
    LIMIT 30;
    `,
    [id_utilisateur]
  );
};

Film.getFilmsGenre = function (genre) {
  return asyncQuery(
    `
    SELECT 
    f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation 
    FROM films f 
    WHERE f.id IN (SELECT DISTINCT(id_film) FROM genres WHERE nom=?)
  `,
    [genre]
  );
};

Film.getFilmsProducteur = function (producteur) {
  return asyncQuery(
    `
    SELECT 
    f.id, f.titre, f.description, f.duree, f.date_diffusion, f.url_affiche, f.url_image, f.date_creation 
    FROM films f 
    WHERE f.id IN (SELECT DISTINCT(id_film) FROM producteurs WHERE nom=?)
  `,
    [producteur]
  );
};

Film.getDuplicates = function () {
  return asyncQuery(
    `
    SELECT
    MAX(id) AS id,
      titre,
      date_diffusion,
      COUNT(*)
    FROM
        films
    GROUP BY titre, date_diffusion
    HAVING COUNT(*) > 1
    ORDER BY id;
    `
  );
};

Film.delete = function (id_film) {
  return asyncQuery("DELETE FROM films WHERE id=?", [id_film]);
};

module.exports.Film = Film;

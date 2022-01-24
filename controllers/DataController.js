const { User } = require("../models/User");
const { Film } = require("../models/Film");
const { Genre } = require("../models/Genre");
const { Producteur } = require("../models/Producteur");
const { Note } = require("../models/Note");
const { Vue } = require("../models/Vue");
const { Liste } = require("../models/Liste");
const { ListeFilm } = require("../models/ListeFilm");
const fetch = require("cross-fetch");

exports.populate = async function (req, res, next) {
  // Vide toutes les tables
  await Promise.all([
    Genre.empty(),
    Note.empty(),
    Producteur.empty(),
    Vue.empty(),
    ListeFilm.empty(),
    Liste.empty(),
    Film.empty(),
    User.empty(),
  ]);

  console.log("Database cleared");

  const randomFromRange = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  const randomDecimalFromRange = (note) => {
    let min = note - 1.0;
    const arr = [];
    for (let i = 0; i < 5; i++) {
      arr.push(min);
      min += 0.5;
    }
    const randomIndex = randomFromRange(0, 5);
    return arr[randomIndex];
  };

  const generateUsername = () => {
    const length = randomFromRange(6, 15);
    let result = "";
    let chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  let username,
    userIds = [];
  for (let i = 0; i < 500; i++) {
    username = generateUsername();
    const userId = await User.createUser({ username, password: "demo" });
    userIds.push(userId);
  }
  console.log(`${userIds.length} users successfully added`);

  for (let i = 1; i < 25; i++) {
    fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=7046735378a2339d3e75389db671810f&language=fr&page=${i}`
    ).then(async (moviesResponse) => {
      const movies = await moviesResponse.json();
      for (let movie of movies.results) {
        fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?api_key=7046735378a2339d3e75389db671810f&language=fr`
        ).then(async (movieResponse) => {
          const m = await movieResponse.json();
          Film.createFilm({
            titre: m.title.replace(/'/g, "\\'"),
            description: m.overview.replace(/'/g, "\\'"),
            duree: m.runtime ? m.runtime : 0,
            date_diffusion: m.release_date,
            url_affiche: `https://image.tmdb.org/t/p/original${m.poster_path}`,
            url_image: `https://image.tmdb.org/t/p/original${m.backdrop_path}`,
          })
            .then(async (id_film) => {
              // Création des genres de chaque film
              for (let genre of m.genres) {
                await Genre.createGenre({ id_film, nom: genre.name });
                console.log(`Added genre ${genre.name} for film #${id_film}`);
              }

              // Création des producteurs de chaque film
              for (let producer of m.production_companies) {
                await Producteur.createProducteur({
                  id_film,
                  nom: producer.name.replace(/'/g, "\\'"),
                  pays: producer.origin_country.replace(/'/g, "\\'"),
                });
                console.log(
                  `Added producer ${producer.name} (${producer.origin_country}) for film #${id_film}`
                );
              }

              // Création des vues de chaque film
              for (let i = 0; i < userIds.length; i++) {
                // Nombre de vues aléatoires entre 0 et 3
                const numberOfViews = randomFromRange(0, 2);
                for (let j = 0; j < numberOfViews; j++) {
                  await Vue.createVue({
                    id_film,
                    id_utilisateur: userIds[i],
                    horodatage: randomFromRange(0, m.runtime * 60 + 1),
                  });
                }
                console.log(
                  `Added ${numberOfViews} views for movie #${id_film}`
                );
              }

              // Création de notes factices basées sur la moyenne récupérées par l'API
              const numberOfNotes = randomFromRange(0, userIds.length + 1);
              const userIdsCopy = [...userIds];
              for (let i = 0; i < numberOfNotes; i++) {
                // On récupère un utilisateur au hasard dans la liste
                const randomUserIndex = randomFromRange(0, userIdsCopy.length);
                m.note_average /= 2;
                const roundedNote = (
                  Math.round(m.vote_average * 2) / 2
                ).toFixed(1);
                // On génère une note aléatoire proche de celle récupérée par l'API
                const randomApproximativeNote =
                  randomDecimalFromRange(roundedNote);

                await Note.createNote({
                  id_film,
                  id_utilisateur: userIdsCopy[randomUserIndex],
                  note: randomApproximativeNote,
                });
                // On supprime le user de la liste une fois sa note renseignée
                userIdsCopy.splice(randomUserIndex, 1);
              }
              console.log(`Added ${numberOfNotes} notes for movie #${id_film}`);
            })
            .catch((err) => console.log(err));
        });
      }
    });
  }

  return res.send("Les données ont bien été créées");
};

// Récupérer les films selon la page i
// Parcours des films
// Récupérer les genres et producteurs / get-movie-details
// Insérer les données du film
// Créer plusieurs notes aléatoires proches de celle récupérée
// Ajouter des vues
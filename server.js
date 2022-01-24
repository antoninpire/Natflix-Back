// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");

require("dotenv").config({ path: path.join(__dirname, ".env") });

// Create a new express application named 'app'
const app = express();

// Set our backend port to be either an environment variable or port 5000
const port = process.env.PORT || 5000;

// This application level middleware prints incoming requests to the servers console, useful to see incoming requests
app.use((req, res, next) => {
  console.log(`Request_Endpoint: ${req.method} ${req.url}`);
  next();
});

// Configure the bodyParser middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

// Require Route
const api = require("./routes/routes");
const authRoutes = require("./routes/AuthRoutes");
const dataRoutes = require("./routes/DataRoutes");
const filmRoutes = require("./routes/FilmRoutes");
const genreRoutes = require("./routes/GenreRoutes");
const listeRoutes = require("./routes/ListeRoutes");
const producteurRoutes = require("./routes/ProducteurRoutes");
const vueRoutes = require("./routes/VueRoutes");
const noteRoutes = require("./routes/NoteRoutes");

// Configure app to use route
app.use("/api/v1/", api);
app.use("/auth/", authRoutes);
app.use("/data/", dataRoutes);
app.use("/films/", filmRoutes);
app.use("/genres/", genreRoutes);
app.use("/lists/", listeRoutes);
app.use("/producers/", producteurRoutes);
app.use("/views/", vueRoutes);
app.use("/notes/", noteRoutes);

// This middleware informs the express application to serve our compiled React files
if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "staging"
) {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
} else {
  app.get("*", function (req, res) {
    res.status(404).send("Route doesnt exist");
  });
}

// Configure our server to listen on the port defiend by our port variable
app.listen(port, () => console.log(`BACK_END_SERVICE_PORT: ${port}`));

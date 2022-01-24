const { Genre } = require("../models/Genre");

exports.getDistinctGenres = async function (req, res, next) {
  return res.json(await Genre.getDistinctGenres());
};

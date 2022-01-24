const { Producteur } = require("../models/Producteur");

exports.getDistinctProducteurs = async function (req, res, next) {
  return res.json(await Producteur.getDistinctProducteurs());
};

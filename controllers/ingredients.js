const { Ingredient } = require("../models/ingredient");
const { ctrlWrapper, HttpError } = require("../helpers");

const findIngredients = async (req, res) => {
  const query = req.body.query;
  console.log(req.body);
  const result = await Ingredient.find({ name: new RegExp(query, "i") });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

module.exports = {
  findIngredients: ctrlWrapper(findIngredients),
};

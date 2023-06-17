const { Recipe } = require("../models/recipe");
const { Ingredient } = require("../models/ingredient");
const { ctrlWrapper, HttpError } = require("../helpers");

const findRecipes = async (req, res) => {
  const { filter, query } = req.body;
  if (!filter) throw HttpError(400, "Filter parameter is required");

  const { page = 1, limit = 8 } = req.query;
  const regex = new RegExp(query, "i");
  const skip = (page - 1) * limit;
  let q = "";

  if (filter === "title") {
    q = { title: regex };
  }
  if (filter === "ingredients") {
    const ingredients = await Ingredient.find({ name: regex }, { _id: 1 });
    const ingredientIds = ingredients.map((item) => item._id.toString());
    q = {
      ingredients: {
        $elemMatch: {
          id: { $in: ingredientIds },
        },
      },
    };
  }

  const total = await Recipe.countDocuments(q);
  const recipes = await Recipe.find(q).skip(skip).limit(limit);
  if (!recipes) throw HttpError(404, "Not found");

  res.json({ recipes, total });
};

module.exports = {
  findRecipes: ctrlWrapper(findRecipes),
};

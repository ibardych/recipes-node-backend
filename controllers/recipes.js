const { Category } = require("../models/category");
const { Recipe } = require("../models/recipe");
const { ctrlWrapper, HttpError } = require("../helpers");

const getCategories = async (req, res) => {
  const result = await Category.find();

  res.json(result);
};

const getRecipesByCategoryList = async (req, res) => {
  const categories = req.body.categories;

  const promises = categories.map((category) => {
    return Recipe.find({ category: category }).limit(4).exec();
  });

  Promise.all(promises).then((result) => {
    res.json(result);
  });

  // const result = await Recipe.find({ category: { $in: categories } }).limit(8);
};

const getRecipesByCategory = async (req, res) => {
  const { category } = req.params;
  const { page, limit } = req.query;

  const skip = (page - 1) * limit;
  const query = { category: category };

  const total = await Recipe.countDocuments(query);

  const recipes = await Recipe.find(query)
    .sort({ popularity: -1, createdAt: 1, title: 1 })
    .skip(skip)
    .limit(limit);

  if (!recipes) throw HttpError(404, "Not found");

  res.json({ recipes, total });
};

const getRecipeById = async (req, res) => {
  const { id } = req.params;

  const result = await Recipe.findById(id).populate("ingredients.id");

  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

const getPopularRecipes = async (req, res) => {
  const { page, limit } = req.query;

  const skip = (page - 1) * limit;

  const total = await Recipe.countDocuments();

  const recipes = await Recipe.find()
    .sort({ popularity: -1, title: 1 })
    .skip(skip)
    .limit(limit);

  if (!recipes) {
    throw HttpError(404, "Not found");
  }

  res.json({ recipes, total });
};

module.exports = {
  getCategories: ctrlWrapper(getCategories),
  getRecipesByCategoryList: ctrlWrapper(getRecipesByCategoryList),
  getRecipesByCategory: ctrlWrapper(getRecipesByCategory),
  getRecipeById: ctrlWrapper(getRecipeById),
  getPopularRecipes: ctrlWrapper(getPopularRecipes),
};

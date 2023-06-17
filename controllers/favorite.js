const { Recipe } = require("../models/recipe");
const { User } = require("../models/user");
const { ctrlWrapper, HttpError } = require("../helpers");

const addRecipeToFavorite = async (req, res) => {
  const { recipeId } = req.body;
  const { _id: userId, favoriteRecipeIds } = req.user;

  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw HttpError(404, "Not found");
  }
  const { favoriteUserIds } = recipe;

  if (favoriteUserIds.indexOf(userId) === -1) {
    favoriteUserIds.push(userId);
    const resultRecipe = await Recipe.findByIdAndUpdate(recipeId, {
      favoriteUserIds,
      popularity: favoriteUserIds.length,
    });
    if (!resultRecipe) {
      throw HttpError(404, "Not found");
    }
  }

  if (favoriteRecipeIds.indexOf(recipeId) === -1) {
    favoriteRecipeIds.push(recipeId);
    const resultUser = await User.findByIdAndUpdate(userId, {
      favoriteRecipeIds,
    });
    if (!resultUser) {
      throw HttpError(404, "Not found");
    }
  }

  res.json({ favoriteRecipeIds });
};

const deleteRecipeFromFavorite = async (req, res) => {
  const { id: recipeId } = req.params;
  const { _id: userId, favoriteRecipeIds: oldRecipeIds } = req.user;

  console.log(recipeId);
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) {
    throw HttpError(404, "Not found");
  }
  const { favoriteUserIds: oldUserIds } = recipe;

  if (oldUserIds.indexOf(userId) !== -1) {
    const favoriteUserIds = oldUserIds.filter((item) => item !== userId);
    const resultRecipe = await Recipe.findByIdAndUpdate(recipeId, {
      favoriteUserIds,
      popularity: favoriteUserIds.length,
    });
    if (!resultRecipe) {
      throw HttpError(404, "Not found");
    }
  }

  const favoriteRecipeIds = oldRecipeIds.filter((item) => item !== recipeId);
  if (oldRecipeIds.length !== favoriteRecipeIds.length) {
    const resultUser = await User.findByIdAndUpdate(userId, {
      favoriteRecipeIds,
    });
    if (!resultUser) {
      throw HttpError(404, "Not found");
    }
  }

  res.json({ favoriteRecipeIds });
};

const getFavoriteRecipes = async (req, res) => {
  const { page, limit } = req.query;
  const { favoriteRecipeIds: ids } = req.user;

  const skip = (page - 1) * limit;
  const query = { _id: { $in: ids } };

  const total = await Recipe.countDocuments(query);
  const recipes = await Recipe.find(query)
    .sort({ createdAt: -1, title: 1 })
    .skip(skip)
    .limit(limit);

  if (!recipes) throw HttpError(404, "Not found");

  res.json({ recipes, total });
};

module.exports = {
  addRecipeToFavorite: ctrlWrapper(addRecipeToFavorite),
  deleteRecipeFromFavorite: ctrlWrapper(deleteRecipeFromFavorite),
  getFavoriteRecipes: ctrlWrapper(getFavoriteRecipes),
};

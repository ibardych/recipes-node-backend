const { Recipe } = require("../models/recipe");
const { ctrlWrapper, HttpError } = require("../helpers");
const path = require("path");
const Jimp = require("jimp");
const fs = require("fs/promises");
const ObjectId = require("mongodb").ObjectId;

const createOwnRecipe = async (req, res) => {
  const { _id: owner } = req.user;
  const parsedIngredients = JSON.parse(req.body.ingredients);

  const newRecipe = await Recipe.create({
    ...req.body,
    ingredients: parsedIngredients,
    owner,
  });

  const { _id: recipeId } = newRecipe;

  const recipeDir = path.join(__dirname, "..", "public", "recipes");

  const { path: tempUpload, originalname } = req.file;
  const recipeNameThumb = `${recipeId}-thumb-${originalname}`;
  const recipeNamePreview = `${recipeId}-preview-${originalname}`;
  const resultUploadThumb = path.join(recipeDir, recipeNameThumb);
  const resultUploadPreview = path.join(recipeDir, recipeNamePreview);

  Jimp.read(tempUpload, async (err, image) => {
    if (err) throw err;
    await image.resize(700, 700).quality(100).write(resultUploadThumb);
    await image.resize(350, 350).quality(100).write(resultUploadPreview);
  });
  fs.unlink(tempUpload);

  const recipeThumb = "recipes/" + recipeNameThumb;
  const recipePreview = "recipes/" + recipeNamePreview;

  const query = { _id: new ObjectId(recipeId) };

  await Recipe.findOneAndUpdate(query, {
    thumb: recipeThumb,
    preview: recipePreview,
  });

  res.status(201).json({
    newRecipe,
  });
};

const getOwnRecipes = async (req, res) => {
  const { _id: owner } = req.user;

  const result = await Recipe.find({ owner }).sort({ createdAt: -1 });

  res.json(result);
};

const deleteOwnRecipeById = async (req, res) => {
  const { recipeId } = req.params;

  const result = await Recipe.findByIdAndRemove(recipeId);

  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json({ recipe: result, message: "Recipe deleted" });
};

module.exports = {
  createOwnRecipe: ctrlWrapper(createOwnRecipe),
  getOwnRecipes: ctrlWrapper(getOwnRecipes),
  deleteOwnRecipeById: ctrlWrapper(deleteOwnRecipeById),
};

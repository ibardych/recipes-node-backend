const { Recipe } = require("../models/recipe");
const { ctrlWrapper, HttpError } = require("../helpers");
const path = require("path");
const Jimp = require("jimp");
const fs = require("fs/promises");

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

  const recipe = await Recipe.findByIdAndUpdate(recipeId, {
    thumb: recipeThumb,
    preview: recipePreview,
  });

  // const recipe = await Recipe.findById(recipeId);

  res.status(201).json(recipe);
};

const createOwnRecipeCloud = async (req, res) => {
  const { _id: owner } = req.user;

  const {
    body: { title, description, category, time, ingredients, instructions },
    file,
  } = req;

  const thumb = file.path;
  const preview = file.path;

  const data = {
    title,
    description,
    category,
    time,
    ingredients: JSON.parse(ingredients),
    instructions,
    thumb,
    preview,
  };

  const result = await Recipe.create({ ...data, owner });

  res.status(201).json(result);
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
  createOwnRecipeCloud: ctrlWrapper(createOwnRecipeCloud),
  getOwnRecipes: ctrlWrapper(getOwnRecipes),
  deleteOwnRecipeById: ctrlWrapper(deleteOwnRecipeById),
};

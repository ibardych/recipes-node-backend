const express = require("express");
const ctrl = require("../../controllers/recipes");
const { authenticate, isValidId } = require("../../middlewares");
// const { schemas } = require("../../models/recipe");

const router = express.Router();

// router.get("/", authenticate, ctrl.getAll);
router.get("/category-list", authenticate, ctrl.getCategories);
router.post("/main-page", authenticate, ctrl.getRecipesByCategoryList);
router.get("/popular", authenticate, ctrl.getPopularRecipes);
router.get("/category/:category", authenticate, ctrl.getRecipesByCategory);
router.get("/:id", authenticate, isValidId, ctrl.getRecipeById);

module.exports = router;

const express = require("express");
const ctrl = require("../../controllers/ownRecipes");
const { authenticate, uploadRecipe } = require("../../middlewares");

const router = express.Router();

router.post(
  "/create",
  authenticate,
  uploadRecipe.single("file"), // upload.single("file"),
  ctrl.createOwnRecipeCloud // ctrl.createOwnRecipe
);
router.get("/", authenticate, ctrl.getOwnRecipes);
router.delete("/:recipeId", authenticate, ctrl.deleteOwnRecipeById);

module.exports = router;

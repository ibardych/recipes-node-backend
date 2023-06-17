const express = require("express");
const ctrl = require("../../controllers/ownRecipes");
const { authenticate, upload } = require("../../middlewares");

const router = express.Router();

router.post(
  "/create",
  authenticate,
  upload.single("file"),
  ctrl.createOwnRecipe
);
router.get("/", authenticate, ctrl.getOwnRecipes);
router.delete("/:recipeId", authenticate, ctrl.deleteOwnRecipeById);

module.exports = router;

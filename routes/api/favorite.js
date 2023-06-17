const express = require("express");
const ctrl = require("../../controllers/favorite");
const { authenticate, isValidId } = require("../../middlewares");

const router = express.Router();

router.post("/", authenticate, ctrl.addRecipeToFavorite);
router.delete("/:id", authenticate, isValidId, ctrl.deleteRecipeFromFavorite);
router.get("/", authenticate, ctrl.getFavoriteRecipes);

module.exports = router;

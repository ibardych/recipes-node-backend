const express = require("express");
const ctrl = require("../../controllers/ingredients");
const { authenticate } = require("../../middlewares");

const router = express.Router();

router.post("/search", authenticate, ctrl.findIngredients);

module.exports = router;

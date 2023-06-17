const express = require("express");
const ctrl = require("../../controllers/search");
const { authenticate } = require("../../middlewares");

const router = express.Router();

router.post("/", authenticate, ctrl.findRecipes);

module.exports = router;

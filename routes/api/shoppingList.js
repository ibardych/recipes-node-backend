const express = require("express");
const ctrl = require("../../controllers/shoppingList");
const { authenticate } = require("../../middlewares");

const router = express.Router();

router.post("/add", authenticate, ctrl.add);
router.delete("/:id", authenticate, ctrl.remove);

module.exports = router;

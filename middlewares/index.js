const validateBody = require("./validateBody");
const validateFavorite = require("./validateFavorite");
const isValidId = require("./isValidId");
const authenticate = require("./authenticate");
const validateSubscription = require("./validateSubscription");
const validateEmail = require("./validateEmail");
const upload = require("./upload");

module.exports = {
  validateBody,
  validateFavorite,
  isValidId,
  authenticate,
  validateSubscription,
  validateEmail,
  upload,
};

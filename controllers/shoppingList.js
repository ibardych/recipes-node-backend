const { User } = require("../models/user");
const { ctrlWrapper, HttpError } = require("../helpers");

const add = async (req, res) => {
  const user = req.user;

  const shoppingList = [...user.shoppingList, { ...req.body }];

  const result = await User.findByIdAndUpdate(
    user._id,
    { shoppingList },
    { returnDocument: "after" }
  );

  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const shoppingList = [...user.shoppingList].filter((item) => item.id !== id);

  const result = await User.findByIdAndUpdate(
    user._id,
    { shoppingList },
    { returnDocument: "after" }
  );

  if (!result) {
    throw HttpError(404, "Not found");
  }

  res.json(result);
};

module.exports = {
  add: ctrlWrapper(add),
  remove: ctrlWrapper(remove),
};

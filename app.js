const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
// require("dotenv").config();

dotenv.config();

const authRouter = require("./routes/api/auth");
const recipesRouter = require("./routes/api/recipes");
const ownRecipesRouter = require("./routes/api/ownRecipes");
const ingredientsRouter = require("./routes/api/ingredients");
const shoppingListRouter = require("./routes/api/shoppingList");
const favoriteRouter = require("./routes/api/favorite");
const searchRouter = require("./routes/api/search");

const app = express();

const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/auth", authRouter);
app.use("/recipes", recipesRouter);
app.use("/own-recipes", ownRecipesRouter);
app.use("/ingredients", ingredientsRouter);
app.use("/shopping-list", shoppingListRouter);
app.use("/favorite", favoriteRouter);
app.use("/search", searchRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

module.exports = app;

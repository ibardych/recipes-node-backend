const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const Joi = require("joi");

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Set title for recipe"],
    },
    category: {
      type: String,
      required: [true, "Set category for recipe"],
    },
    description: {
      type: String,
      required: [true, "Set description for recipe"],
    },
    thumb: {
      type: String,
    },
    preview: {
      type: String,
    },
    instructions: {
      type: String,
      required: [true, "Set instructions for recipe"],
    },
    time: {
      type: String,
      required: [true, "Set time for recipe"],
    },
    ingredients: [
      {
        _id: false,
        id: {
          type: String,
          ref: "ingredient",
        },
        measure: { type: String },
      },
    ],
    area: {
      type: String,
      default: "Unknown",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    popularity: {
      type: Number,
    },
    favoriteUserIds: {
      type: Array,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    // timestamps: true,
  }
);

recipeSchema.post("save", handleMongooseError);

const Recipe = model("recipe", recipeSchema);

const addSchema = Joi.object({
  title: Joi.string().required().messages({
    "any.required": "Missing required name field",
  }),
  category: Joi.string().required().messages({
    "any.required": "Missing required email field",
  }),
  description: Joi.string().required().messages({
    "any.required": "Missing required phone field",
  }),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required().messages({
    "any.required": "Missing field favorite",
  }),
});

const schemas = {
  addSchema,
  updateFavoriteSchema,
};

module.exports = { Recipe, schemas };

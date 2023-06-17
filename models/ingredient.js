const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");
const Joi = require("joi");

const ingredientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for ingredient"],
    },
    desc: {
      type: String,
      required: [true, "Set description for ingredient"],
    },
    img: {
      type: String,
    },
  },
  {
    versionKey: false,
    // timestamps: true,
  }
);

ingredientSchema.post("save", handleMongooseError);

const Ingredient = model("ingredient", ingredientSchema);

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

const schemas = {
  addSchema,
};

module.exports = { Ingredient, schemas };

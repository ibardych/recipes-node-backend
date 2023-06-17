const { Schema, model } = require("mongoose");
const { handleMongooseError } = require("../helpers");

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Set name for category"],
  },
});

categorySchema.post("save", handleMongooseError);

const Category = model("category", categorySchema);

module.exports = { Category };

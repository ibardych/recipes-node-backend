const multer = require("multer");
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { HttpError } = require("../helpers");

const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

const recipeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("test");

    if (!file) {
      throw HttpError(404, "Image Not found");
    }

    let folder;
    console.log(file.fieldname);
    if (file.fieldname === "file") {
      folder = "recipeIMG";
    } else {
      folder = "docs";
    }
    return {
      folder: folder,
      allowed_formats: ["jpg", "png", "webp"],
      public_id: file.originalname,
      transformation: [
        { width: 350, height: 350 },
        { width: 700, height: 700 },
      ],
    };
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (!file) {
      throw HttpError(404, "Image Not found");
    }

    const { _id } = req.user;
    let folder;
    if (file.fieldname === "file") {
      folder = "avatars";
    } else {
      folder = "docs";
    }
    return {
      folder: folder,
      allowed_formats: ["jpg", "png", "webp"],
      public_id: `${_id}_${file.originalname}`,
      transformation: [{ width: 200, height: 200, crop: "fill" }],
    };
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadRecipe = multer({ storage: recipeStorage });

module.exports = { uploadAvatar, uploadRecipe };

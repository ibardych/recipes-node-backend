const { User } = require("../models/user");
const { HttpError, ctrlWrapper, sendEmail } = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY, BASE_URL } = process.env;

const accessTokenExpiresIn = "2m";
const refreshTokenExpiresIn = "7d";

const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(req.body.email, { s: "250" });
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL: `https:${avatarURL}`,
    verificationToken,
  });

  /*
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);
  */

  res.status(201).json({
    user: {
      email: newUser.email,
      username: newUser.username,
    },
  });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">Click to verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({
    message: "Verification email sent",
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verificationToken: null,
    verify: true,
  });
  res.status(200).json({ message: "Verification successful" });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(403, "Email or password is wrong");
  }

  if (!user.verify) {
    // throw HttpError(401, "Email not verified");
  }

  const passwordCompare = await bcrypt.compare(password, user.password);

  if (!passwordCompare) {
    throw HttpError(403, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
    expiresIn: accessTokenExpiresIn,
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    expiresIn: refreshTokenExpiresIn,
  });

  await User.findByIdAndUpdate(user._id, { accessToken, refreshToken });

  res.status(201).json({
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      avatarURL: user.avatarURL,
    },
  });
};

const refresh = async (req, res) => {
  const { refreshToken: token } = req.body;

  try {
    const { id } = jwt.verify(token, REFRESH_SECRET_KEY);

    const isExist = await User.findOne({ refreshToken: token });

    if (!isExist) {
      throw HttpError(403, "Token invalid");
    } else {
      console.log("exist");
    }

    const payload = { id };

    const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
      expiresIn: accessTokenExpiresIn,
    });

    // const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
    //   expiresIn: refreshTokenExpiresIn,
    // });

    await User.findByIdAndUpdate(id, { accessToken });

    res.status(201).json({ accessToken });

    // await User.findByIdAndUpdate(id, { accessToken, refreshToken });

    // res.status(201).json({
    //   accessToken,
    //   refreshToken,
    // });
  } catch (error) {
    throw HttpError(403, error.message);
  }
};

const getCurrentUser = async (req, res) => {
  const {
    _id,
    email,
    username,
    avatarURL,
    gravatar,
    shoppingList,
    favoriteRecipeIds,
  } = req.user;

  res.json({
    _id,
    email,
    username,
    avatarURL,
    gravatar,
    shoppingList,
    favoriteRecipeIds,
  });
};

const logout = async (req, res) => {
  const { _id: userId } = req.user;

  await User.findByIdAndUpdate(userId, { accessToken: "", refreshToken: "" });

  res.status(204).json({});
};

const updateSubscription = async (req, res) => {
  const { _id: userId } = req.user;

  const result = await User.findByIdAndUpdate(userId, req.body);
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const updateUserData = async (req, res) => {
  const { username } = req.body;

  const { _id: userId } = req.user;

  const user = {
    avatarURL: req.user.avatarURL,
    gravatar: req.user.gravatar,
    username: username,
  };

  if (req.file) {
    const avatarDir = path.join(__dirname, "..", "public", "avatars");
    const { path: tempUpload, originalname } = req.file;
    const avatarName = `${userId}_${originalname}`;
    const resultUpload = path.join(avatarDir, avatarName);

    Jimp.read(tempUpload, (err, image) => {
      if (err) throw err;
      image.resize(250, 250).quality(100).write(resultUpload);
    });
    fs.unlink(tempUpload);

    user.avatarURL = "avatars/" + avatarName;
    user.gravatar = false;
  }

  await User.findByIdAndUpdate(userId, user);

  res.status(200).json(user);
};

const updateUserDataCloud = async (req, res) => {
  const { _id } = req.user;

  const { username } = req.body;

  const newData = { username };

  if (req.file) {
    console.log(req.file.path);
    newData.avatarURL = req.file.path;
  }

  console.log(newData);

  const user = await User.findByIdAndUpdate(_id, newData, {
    returnDocument: "after",
  });

  res.status(200).json(user);
};

module.exports = {
  register: ctrlWrapper(register),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  verifyEmail: ctrlWrapper(verifyEmail),
  login: ctrlWrapper(login),
  refresh: ctrlWrapper(refresh),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateUserData: ctrlWrapper(updateUserData),
  updateUserDataCloud: ctrlWrapper(updateUserDataCloud),
};

const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true,
    httpOnly: true,
  });
  //Remove the password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    user: {
      token: token,
      username: user.name,
      email: user.email,
    },
  });
};
exports.signup = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      res.json({
        status: "error",
        message: "User with this mail already exists.Try another one",
      });
      return;
    }
    const newUser = await User.create({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.log(err);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //First check if email and password exists.
    if (!email || !password) {
      res.json({
        status: "error",
        message: "Please provide email and password",
      });
      return;
    }
    //Check if the user exists.
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      res.json({
        status: "error",
        message: "Incorrect email or password",
      });
      return;
    }
    // If everything ok, send webtoken to client.

    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err);
  }
};
exports.protect = async (req, res, next) => {
  try {
    //1) Getting token and check if it is there
    let token;

    token = req.body.token;

    // console.log(token);/
    if (!token) {
      res.json({
        status: "error",
        message: "You are not logged in.Please login to get access",
      });
      return;
      // return next(
      //   new Error("You are not logged in.Please login to get access")
      // );
    }
    //2) Verification of the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);
    //3)  Check if user still exists
    const freshUser = await User.findById(decoded.id).populate("badgeId");
    if (!freshUser) {
      res.json({
        status: "error",
        message: "The user belonging to token no longer exist",
      });
      return;
      // return next(new Error("The user belonging to token no longer exist"));
    }
    //4) Check if user changed password after the jwt issued.
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      res.json({
        status: "error",
        message: "User recently changed password. Please log in again.",
      });
      return;
      // return next(
      //   new Error("User recently changed password. Please log in again.")
      // );
    }
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    next();
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};
exports.forgetPassword = async (req, res, next) => {
  try {
    //1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.json({
        status: "error",
        message: "There is no user with that email address",
      });
      return;
    }
    //2) Generate the random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) Send it to user's email
    const message = `This is your password reset token  ${resetToken}`;
    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token is valid for 10 min",
        message,
      });
      res.json({
        status: "success",
        message: "Token sent",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.log(err);
      res.json({
        status: "error",
        message: "There was an error sending email. Try again later",
      });
      return;
    }
  } catch (err) {
    console.log(err);
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    //1 Get the user based on the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.body.resettoken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    //2 If token has not expired and there is user, set new password
    if (!user) {
      res.json({
        status: "error",
        message: "Token is invalid or has expired",
      });
      return;
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //3 Update changedPasswordAt property for the user

    //4 log the user in, send JWT.
    createSendToken(user, 200, res);
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Some error occurred in the app. Try agin later.",
    });
  }
};

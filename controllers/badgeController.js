const Badge = require("../models/badgeModel");
const User = require("../models/userModel");
exports.hasAlreadyMadeEntry = (req, res, next) => {
  var entryTime = new Date();
  if (!req.user.badgeId) return next();
  if (req.user.badgeId.nextentryTimeBegin > entryTime) {
    res.json({
      status: "error",
      message: "You have already made entry for today.",
    });
    return;
  }
  return next();
};
exports.madeYes = async (req, res, next) => {
  var entryTime = new Date();
  var nextEntryStart = new Date();
  nextEntryStart.setTime(entryTime.getTime());
  nextEntryStart.setDate(nextEntryStart.getDate() + 1);
  nextEntryStart.setHours(0);
  nextEntryStart.setMinutes(0);
  nextEntryStart.setSeconds(0);
  nextEntryStart.setMilliseconds(0);
  var nextEntryEnd = new Date();
  nextEntryEnd.setTime(nextEntryStart.getTime());
  nextEntryEnd.setDate(nextEntryEnd.getDate() + 1);

  let badge;
  try {
    if (!req.user.badgeId) {
      badge = await Badge.create({
        currentStreak: 1,
        maxdayStreak: 1,
        nextMilestone: 7,
        entryMadeAt: entryTime,
        nextentryTimeBegin: nextEntryStart,
        nextEntryTimeEnd: nextEntryEnd,
      });
      const user = await User.findById(req.user._id);
      user.badgeId = badge._id;
      await user.save({ validateBeforeSave: false });
      res.json({
        status: "success",
        badge,
      });
    } else {
      const badgeofUser = await Badge.findById(req.user.badgeId._id);
      if (badgeofUser.nextEntryTimeEnd < entryTime) {
        badgeofUser.currentStreak = 1;
        badgeofUser.nextMilestone = 7;
      } else {
        badgeofUser.currentStreak += 1;
        if (badgeofUser.currentStreak > badgeofUser.maxdayStreak) {
          badgeofUser.maxdayStreak = badgeofUser.currentStreak;
        }
        if (badgeofUser.maxdayStreak >= 1 && badgeofUser.maxdayStreak < 7) {
          badgeofUser.nextMilestone = 7;
        } else if (
          badgeofUser.maxdayStreak >= 7 &&
          badgeofUser.maxdayStreak < 15
        ) {
          badgeofUser.nextMilestone = 15;
        } else if (
          badgeofUser.maxdayStreak >= 15 &&
          badgeofUser.maxdayStreak < 20
        ) {
          badgeofUser.nextMilestone = 20;
        } else if (
          badgeofUser.maxdayStreak >= 20 &&
          badgeofUser.maxdayStreak < 30
        ) {
          badgeofUser.nextMilestone = 30;
        } else if (
          badgeofUser.maxdayStreak >= 30 &&
          badgeofUser.maxdayStreak < 60
        ) {
          badgeofUser.nextMilestone = 60;
        } else if (
          badgeofUser.maxdayStreak >= 60 &&
          badgeofUser.maxdayStreak < 90
        ) {
          badgeofUser.nextMilestone = 90;
        } else if (
          badgeofUser.maxdayStreak >= 90 &&
          badgeofUser.maxdayStreak < 120
        ) {
          badgeofUser.nextMilestone = 120;
        } else if (
          badgeofUser.maxdayStreak >= 120 &&
          badgeofUser.maxdayStreak < 150
        ) {
          badgeofUser.nextMilestone = 150;
        } else if (
          badgeofUser.maxdayStreak > 150 &&
          badgeofUser.maxdayStreak < 180
        ) {
          badgeofUser.nextMilestone = 180;
        } else {
          badgeofUser.nextMilestone = badgeofUser.maxdayStreak;
        }
      }
      badgeofUser.entryMadeAt = entryTime;
      badgeofUser.nextentryTimeBegin = nextEntryStart;
      badgeofUser.nextEntryTimeEnd = nextEntryEnd;
      await badgeofUser.save();

      res.json({
        status: "success",
        badge: badgeofUser,
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Some error occurred in app.Try again later.",
    });
  }
};
exports.madeNo = async (req, res, next) => {
  var entryTime = new Date();
  var nextEntryStart = new Date();
  nextEntryStart.setTime(entryTime.getTime());
  nextEntryStart.setDate(nextEntryStart.getDate() + 1);
  nextEntryStart.setHours(0);
  nextEntryStart.setMinutes(0);
  nextEntryStart.setSeconds(0);
  nextEntryStart.setMilliseconds(0);
  var nextEntryEnd = new Date();
  nextEntryEnd.setTime(nextEntryStart.getTime());
  nextEntryEnd.setDate(nextEntryEnd.getDate() + 1);

  let badge;
  try {
    if (!req.user.badgeId) {
      badge = await Badge.create({
        currentStreak: 0,
        maxdayStreak: 0,
        nextMilestone: 1,
        entryMadeAt: entryTime,
        nextentryTimeBegin: nextEntryStart,
        nextEntryTimeEnd: nextEntryEnd,
      });
      const user = await User.findById(req.user._id);
      user.badgeId = badge._id;
      await user.save({ validateBeforeSave: false });
    } else {
      badge = await Badge.findById(req.user.badgeId._id);
      badge.currentStreak = 0;
      badge.entryMadeAt = entryTime;
      badge.nextentryTimeBegin = nextEntryStart;
      badge.nextEntryTimeEnd = nextEntryEnd;
      await badge.save();
    }
    res.json({
      status: "success",
      badge,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Some error occurred in app. Try again later.",
    });
  }
};
exports.getbadge = (req, res, next) => {
  var max, mile, curr;
  try {
    if (req.user.badgeId) {
      max = req.user.badgeId.maxdayStreak;
      mile = req.user.badgeId.nextMilestone;
      curr = req.user.badgeId.currentStreak;
    } else {
      max = 0;
      mile = 0;
      curr = 0;
    }
    res.json({
      status: "success",
      maxStreak: max,
      nextMilestone: mile,
      currentStreak: curr,
    });
    return;
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Some error occurred in app. Try again later.",
    });
    return;
  }
};
exports.madeNoByDefault = async (req, res, next) => {
  var entryTime = new Date();
  var nextEntryStart = new Date();
  nextEntryStart.setTime(entryTime.getTime());
  nextEntryStart.setHours(0);
  nextEntryStart.setMinutes(0);
  nextEntryStart.setSeconds(0);
  nextEntryStart.setMilliseconds(0);
  var nextEntryEnd = new Date();
  nextEntryEnd.setTime(nextEntryStart.getTime());
  nextEntryEnd.setDate(nextEntryEnd.getDate() + 1);

  let badge;
  try {
    if (!req.user.badgeId) {
      badge = await Badge.create({
        currentStreak: 0,
        maxdayStreak: 0,
        nextMilestone: 1,
        entryMadeAt: entryTime,
        nextentryTimeBegin: nextEntryStart,
        nextEntryTimeEnd: nextEntryEnd,
      });
      const user = await User.findById(req.user._id);
      user.badgeId = badge._id;
      await user.save({ validateBeforeSave: false });
    } else if (entryTime > req.user.badgeId.nextEntryTimeEnd) {
      badge = await Badge.findById(req.user.badgeId._id);
      badge.currentStreak = 0;
      badge.entryMadeAt = entryTime;
      badge.nextentryTimeBegin = nextEntryStart;
      badge.nextEntryTimeEnd = nextEntryEnd;
      await badge.save();
    } else {
      badge = await Badge.findById(req.user.badgeId._id);
    }
    res.json({
      status: "success",
      badge,
    });
  } catch (err) {
    console.log(err);
    res.json({
      status: "error",
      message: "Some error occurred in app. Try again later.",
    });
  }
};

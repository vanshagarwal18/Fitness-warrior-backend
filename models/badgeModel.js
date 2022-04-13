const mongoose = require("mongoose");
const badgeSchema = new mongoose.Schema(
  {
    currentStreak: {
      type: Number,
      required: [true, "User must have a current Streak"],
    },
    maxdayStreak: {
      type: Number,
    },
    nextMilestone: {
      type: Number,
    },
    entryMadeAt: Date,
    nextentryTimeBegin: Date,
    nextEntryTimeEnd: Date,
  },
  {
    timestamps: true,
  }
);

const Badge = mongoose.model("Badge", badgeSchema);

module.exports = Badge;

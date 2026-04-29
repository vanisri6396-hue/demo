const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
    type:    {
      type: String,
      enum: ["leave", "attendance", "system", "general"],
      default: "general"
    },
    meta:    { type: mongoose.Schema.Types.Mixed }  // extra payload if needed
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Alert title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Alert description is required'],
      trim: true,
    },
    raisedBy: {
      type: String,
      default: 'Visitor / Anonymous',
      trim: true,
    },
    role: {
      type: String,
      default: 'Visitor',
    },
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      default: null,
    },
    urgency: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'High',
    },
    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Alert || mongoose.model('Alert', alertSchema);

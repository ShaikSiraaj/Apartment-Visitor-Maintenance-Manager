const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of visit is required'],
      trim: true,
    },
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      required: [true, 'Apartment destination is required'],
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    entryTime: {
      type: Date,
      default: Date.now,
    },
    exitTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Inside', 'Exited'],
      default: 'Inside',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);

const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema(
  {
    flatNumber: {
      type: String,
      required: [true, 'Flat number is required'],
      unique: true,
      trim: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
    },
    residentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.models.Apartment || mongoose.model('Apartment', apartmentSchema);

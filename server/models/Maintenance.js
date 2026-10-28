const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Resident ID is required'],
    },
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      required: [true, 'Apartment ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Electrical', 'Plumbing', 'Cleaning', 'Carpentry', 'General'],
      default: 'General',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    assignedTo: {
      type: String,
      default: 'Unassigned',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);

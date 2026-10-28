const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Apartment = require('./models/Apartment');
const Visitor = require('./models/Visitor');
const Maintenance = require('./models/Maintenance');

const seedData = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/apartment_manager';
    await mongoose.connect(connUri);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany({});
    await Apartment.deleteMany({});
    await Visitor.deleteMany({});
    await Maintenance.deleteMany({});

    const passwordHash = await bcrypt.hash('password123', 10);

    // Create Apartments
    const apt1 = await Apartment.create({ flatNumber: 'A-101', floor: 1 });
    const apt2 = await Apartment.create({ flatNumber: 'B-202', floor: 2 });

    // Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@apartment.com',
      password: passwordHash,
      role: 'Admin',
    });

    const resident = await User.create({
      name: 'John Doe',
      email: 'resident@apartment.com',
      password: passwordHash,
      role: 'Resident',
      apartmentId: apt1._id,
    });

    const guard = await User.create({
      name: 'Guard Robert',
      email: 'security@apartment.com',
      password: passwordHash,
      role: 'Security Guard',
    });

    apt1.residentIds.push(resident._id);
    await apt1.save();

    // Create Sample Visitor
    await Visitor.create({
      name: 'Alice Smith',
      phone: '555-0199',
      purpose: 'Delivery',
      apartmentId: apt1._id,
      residentId: resident._id,
      entryTime: new Date(),
      status: 'Inside',
    });

    // Create Sample Maintenance Request
    await Maintenance.create({
      residentId: resident._id,
      apartmentId: apt1._id,
      title: 'Water Leak in Bathroom',
      description: 'The main pipe under the tap is leaking water continuously.',
      category: 'Plumbing',
      status: 'Pending',
    });

    console.log('Database seeded successfully!');
    console.log('Test Accounts created:');
    console.log('Admin: admin@apartment.com / password123');
    console.log('Resident: resident@apartment.com / password123');
    console.log('Security Guard: security@apartment.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

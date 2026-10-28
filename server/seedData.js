const bcrypt = require('bcryptjs');
const { memoryDb, isMock } = require('./config/supabase');

const seedData = async () => {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    if (isMock) {
      memoryDb.users = [];
      memoryDb.apartments = [];
      memoryDb.visitors = [];
      memoryDb.maintenance = [];
      memoryDb.alerts = [];

      // Create Apartments
      const apt1 = { _id: 'apt-101', flatNumber: 'A-101', floor: 1, residentIds: [] };
      const apt2 = { _id: 'apt-202', flatNumber: 'B-202', floor: 2, residentIds: [] };
      memoryDb.apartments.push(apt1, apt2);

      // Create Users with predefined Indian Names
      const admin = {
        _id: 'usr-admin-1',
        name: 'Rajesh Kumar',
        email: 'admin@apartment.com',
        password: passwordHash,
        role: 'Admin',
      };

      const resident1 = {
        _id: 'usr-raju-2',
        name: 'Raju Sharma',
        email: 'raju@apartment.com',
        password: passwordHash,
        role: 'Resident',
        apartmentId: apt1._id,
      };

      const resident2 = {
        _id: 'usr-sita-3',
        name: 'Sita Patel',
        email: 'sita@apartment.com',
        password: passwordHash,
        role: 'Resident',
        apartmentId: apt2._id,
      };

      const guard = {
        _id: 'usr-suresh-4',
        name: 'Suresh Guard',
        email: 'security@apartment.com',
        password: passwordHash,
        role: 'Security Guard',
      };

      memoryDb.users.push(admin, resident1, resident2, guard);

      // Add Sample Visitors with Indian names
      memoryDb.visitors.push({
        _id: 'vis-ram-1',
        name: 'Ram Verma',
        phone: '9876543210',
        purpose: 'Delivery',
        apartmentId: apt1,
        residentId: { _id: resident1._id, name: resident1.name, email: resident1.email },
        entryTime: new Date().toISOString(),
        exitTime: null,
        status: 'Inside',
      });

      memoryDb.visitors.push({
        _id: 'vis-priya-2',
        name: 'Priya Singh',
        phone: '9812345678',
        purpose: 'Guest Visit',
        apartmentId: apt2,
        residentId: { _id: resident2._id, name: resident2.name, email: resident2.email },
        entryTime: new Date(Date.now() - 3600000).toISOString(),
        exitTime: new Date().toISOString(),
        status: 'Exited',
      });

      // Add Sample Maintenance Request
      memoryDb.maintenance.push({
        _id: 'maint-1',
        residentId: { _id: resident1._id, name: resident1.name, email: resident1.email },
        apartmentId: apt1,
        title: 'Water Leakage in Kitchen Tap',
        description: 'The kitchen sink pipe is leaking continuously.',
        category: 'Plumbing',
        status: 'Pending',
        assignedTo: 'Unassigned',
        createdAt: new Date().toISOString(),
      });

      // Add Sample Alert
      memoryDb.alerts.push({
        _id: 'alert-1',
        title: 'Visitor Gate Obstruction',
        description: 'Vehicle parked right in front of Gate A blocking entry.',
        raisedBy: 'Ram Verma (Visitor)',
        role: 'Visitor',
        apartmentId: apt1,
        urgency: 'Urgent',
        status: 'Active',
        createdAt: new Date().toISOString(),
      });

      console.log('Database seeded successfully with Indian names (Rajesh, Raju, Sita, Suresh, Ram, Priya)!');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = seedData;

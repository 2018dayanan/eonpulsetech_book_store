const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Must load environment variables first if running directly via node
require('dotenv').config({ path: '.env' });

// Redefine Admin model to avoid ES Module import issues in a raw Node script
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function seedAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@example.com';
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await Admin.create({
      name: 'Super Admin',
      email: adminEmail,
      password: hashedPassword,
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();

export {};

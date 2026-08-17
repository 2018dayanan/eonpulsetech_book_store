import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import connectToDatabase from '../lib/db/connect';
import Book from '../lib/models/Book';
import Category from '../lib/models/Category';
import User from '../lib/models/User';

async function seed() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Connected!');

    // 1. Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Book.deleteMany({});
    await User.deleteMany({});

    // 2. Seed 10 Categories
    console.log('Seeding Categories...');
    const categoriesData = [
      { name: 'Web Development', slug: 'web-development', description: 'Guides on frontend, backend, and full-stack frameworks.' },
      { name: 'Mobile App Development', slug: 'mobile-app-development', description: 'Resources for cross-platform and native mobile apps.' },
      { name: 'Data Science & AI', slug: 'data-science-ai', description: 'Machine learning, artificial intelligence, and data engineering.' },
      { name: 'DevOps & Cloud', slug: 'devops-cloud', description: 'CI/CD pipelines, Docker, Kubernetes, and cloud platforms.' },
      { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Ethical hacking, network security, and cryptography fundamentals.' },
      { name: 'Database Management', slug: 'database-management', description: 'SQL, NoSQL, data modeling, and performance optimization.' },
      { name: 'System Design', slug: 'system-design', description: 'Scalable architecture, distributed systems, and microservices.' },
      { name: 'Programming Languages', slug: 'programming-languages', description: 'In-depth mastery of Python, JavaScript, Rust, Go, and C++.' },
      { name: 'UI/UX & Frontend Design', slug: 'ui-ux-design', description: 'Design systems, user research, CSS, and component libraries.' },
      { name: 'Career & Tech Leadership', slug: 'career-tech-leadership', description: 'Coding interview prep, engineering management, and soft skills.' },
    ];

    const insertedCategories = await Category.insertMany(categoriesData as any);

    // Create a lookup helper to find category IDs by slug easily
    const categoryMap = insertedCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {} as Record<string, mongoose.Types.ObjectId>);

    // 3. Seed Users
    console.log('Seeding Users...');
    await User.create([
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Hash with bcrypt in production!
      },
      {
        name: 'Test Buyer',
        email: 'user@example.com',
        password: 'password123',
      },
    ]);

    // 4. Seed 20 Books (Products)
    console.log('Seeding 20 Books...');
    const sampleCover = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';
    const samplePdf = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.pdf';

    const booksData = [
      // Web Development
      {
        title: 'Next.js & MongoDB Mastery',
        description: 'Learn how to build modern production-ready full-stack web applications.',
        price: 19.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['web-development'],
      },
      {
        title: 'React 19 Deep Dive',
        description: 'Master React Server Components, Actions, and modern state management strategies.',
        price: 24.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['web-development'],
      },
      // Mobile App Development
      {
        title: 'Flutter & Dart Cookbook',
        description: 'Build beautiful, cross-platform mobile apps for iOS and Android from a single codebase.',
        price: 29.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['mobile-app-development'],
      },
      {
        title: 'React Native for Enterprise',
        description: 'Scale native mobile apps with clean architectural patterns and native module integration.',
        price: 22.50,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['mobile-app-development'],
      },
      // Data Science & AI
      {
        title: 'Practical Machine Learning with Python',
        description: 'Hands-on guide to Scikit-Learn, TensorFlow, and PyTorch for predictive modeling.',
        price: 34.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['data-science-ai'],
      },
      {
        title: 'LLM Fine-Tuning Handbook',
        description: 'Train, fine-tune, and deploy custom open-source Large Language Models safely.',
        price: 39.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['data-science-ai'],
      },
      // DevOps & Cloud
      {
        title: 'Docker & Kubernetes in Action',
        description: 'Containerize, orchestrate, and manage resilient microservice deployments.',
        price: 27.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['devops-cloud'],
      },
      {
        title: 'AWS Certified Solutions Architect Guide',
        description: 'Comprehensive strategies to design secure, cost-effective cloud solutions.',
        price: 31.00,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['devops-cloud'],
      },
      // Cybersecurity
      {
        title: 'Ethical Hacking Fundamentals',
        description: 'Learn penetration testing techniques, vulnerability scans, and security audits.',
        price: 25.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['cybersecurity'],
      },
      {
        title: 'Web Application Security & OWASP Top 10',
        description: 'Protect serverless and monolithic web applications against common security exploits.',
        price: 18.50,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['cybersecurity'],
      },
      // Database Management
      {
        title: 'NoSQL Data Modeling with MongoDB',
        description: 'Schema design patterns, index optimization, and aggregation pipeline techniques.',
        price: 21.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['database-management'],
      },
      {
        title: 'PostgreSQL Architecture & Tuning',
        description: 'Advanced relational queries, indexing strategies, and database performance tuning.',
        price: 28.00,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['database-management'],
      },
      // System Design
      {
        title: 'Designing Data-Intensive Applications',
        description: 'Master consistency, fault tolerance, reliability, and scaling multi-node systems.',
        price: 42.00,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['system-design'],
      },
      {
        title: 'Microservice Patterns & Anti-Patterns',
        description: 'Break down monolithic applications into clean, maintainable microservice architectures.',
        price: 30.00,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['system-design'],
      },
      // Programming Languages
      {
        title: 'Effective TypeScript',
        description: '30 practical ways to improve your TypeScript code quality and type safety.',
        price: 23.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['programming-languages'],
      },
      {
        title: 'The Rust Programming Language',
        description: 'Master memory safety, concurrency, and zero-cost abstractions with Rust.',
        price: 32.50,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['programming-languages'],
      },
      // UI/UX & Frontend Design
      {
        title: 'Tailwind CSS for Production',
        description: 'Design, build, and ship modern responsive user interfaces quickly.',
        price: 15.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['ui-ux-design'],
      },
      {
        title: 'Design Systems from Scratch',
        description: 'Create scalable, reusable UI components and brand guidelines for cross-functional teams.',
        price: 26.00,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['ui-ux-design'],
      },
      // Career & Tech Leadership
      {
        title: 'Grokking the Coding Interview',
        description: 'Algorithmic patterns and data structures for passing technical software engineering interviews.',
        price: 29.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['career-tech-leadership'],
      },
      {
        title: 'The Staff Engineer Pathway',
        description: 'Navigate tech leadership roles, influence technical strategy, and mentor engineers.',
        price: 24.99,
        coverImage: sampleCover,
        pdfUrl: samplePdf,
        categoryId: categoryMap['career-tech-leadership'],
      },
    ];

    await Book.insertMany(booksData as any);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
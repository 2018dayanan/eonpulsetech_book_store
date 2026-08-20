import Book from '../models/Book';
import connectToDatabase from './connect';

export async function getBooks() {
  await connectToDatabase();

  const books = await Book.find().sort({ createdAt: -1 }).lean();

  // Map MongoDB books to the shape that the Vercel Commerce UI expects
  return books.map((book: any) => ({
    id: book._id.toString(),
    handle: book._id.toString(), // URL slug, using ID for now
    title: book.title,
    description: book.description,
    descriptionHtml: `<p>${book.description}</p>`,
    availableForSale: true,
    priceRange: {
      maxVariantPrice: {
        amount: book.price.toString(),
        currencyCode: 'INR',
      },
      minVariantPrice: {
        amount: book.price.toString(),
        currencyCode: 'INR',
      }
    },
    featuredImage: {
      url: book.coverImage,
      altText: book.title,
      width: 1000,
      height: 1000
    },
    images: [
      {
        url: book.coverImage,
        altText: book.title,
        width: 1000,
        height: 1000
      }
    ],
    seo: {
      title: book.title,
      description: book.description
    },
    tags: [],
    updatedAt: book.updatedAt.toISOString(),
    pdfUrl: book.pdfUrl // Our custom field
  }));
}

import { cookies } from 'next/headers';
import Cart from '../models/Cart';

export async function createCart(): Promise<any> {
  await connectToDatabase();
  const cart = await Cart.create({ lines: [] });
  return { id: cart._id.toString() };
}

export async function getCart(): Promise<any> {
  const cartId = (await cookies()).get('cartId')?.value;
  if (!cartId || !mongoose.Types.ObjectId.isValid(cartId)) return undefined;

  await connectToDatabase();
  const cart = await Cart.findById(cartId).lean();
  if (!cart) return undefined;

  // Manually populate books for each line item
  const validMerchandiseIds = cart.lines
    .map(line => line.merchandiseId)
    .filter(id => mongoose.Types.ObjectId.isValid(id));

  const books = await Book.find({ _id: { $in: validMerchandiseIds } } as any).lean();
  const bookMap = new Map(books.map(b => [b._id.toString(), b]));

  let totalQuantity = 0;
  let subtotal = 0;

  const formattedLines = cart.lines.map((line: any) => {
    const book = bookMap.get(line.merchandiseId);
    if (!book) return null;

    totalQuantity += line.quantity;
    const lineCost = line.quantity * book.price;
    subtotal += lineCost;

    return {
      id: line.id,
      quantity: line.quantity,
      cost: { totalAmount: { amount: lineCost.toString(), currencyCode: 'INR' } },
      merchandise: {
        id: book._id.toString(),
        title: 'Default Title',
        selectedOptions: [{ name: 'Title', value: 'Default Title' }],
        product: {
          title: book.title,
          handle: book._id.toString(),
          availableForSale: true,
          featuredImage: { url: book.coverImage, altText: book.title, width: 500, height: 500 },
          priceRange: {
            maxVariantPrice: { amount: book.price.toString(), currencyCode: 'INR' },
          },
        }
      }
    };
  }).filter(Boolean);

  return {
    id: cart._id.toString(),
    checkoutUrl: '/checkout',
    totalQuantity,
    lines: formattedLines,
    cost: {
      subtotalAmount: { amount: subtotal.toString(), currencyCode: 'INR' },
      totalAmount: { amount: subtotal.toString(), currencyCode: 'INR' },
      totalTaxAmount: { amount: '0', currencyCode: 'INR' }
    }
  };
}

export async function addToCart(lines: { merchandiseId: string, quantity: number }[]) {
  let cartId = (await cookies()).get('cartId')?.value;
  await connectToDatabase();

  let cart;
  if (cartId && mongoose.Types.ObjectId.isValid(cartId)) {
    cart = await Cart.findById(cartId);
  }

  if (!cart) {
    cart = await Cart.create({ lines: [] });
    (await cookies()).set('cartId', cart._id.toString());
  }

  for (const item of lines) {
    const existingLine = cart.lines.find((l: any) => l.merchandiseId === item.merchandiseId);
    if (existingLine) {
      existingLine.quantity += item.quantity;
    } else {
      cart.lines.push({
        id: new mongoose.Types.ObjectId().toString(),
        merchandiseId: item.merchandiseId,
        quantity: item.quantity
      });
    }
  }

  await cart.save();
}

export async function removeFromCart(lineIds: string[]) {
  const cartId = (await cookies()).get('cartId')?.value;
  if (!cartId) return;

  await connectToDatabase();
  const cart = await Cart.findById(cartId);
  if (!cart) return;

  cart.lines = cart.lines.filter((line: any) => !lineIds.includes(line.id));
  await cart.save();
}

export async function updateCart(lines: { id: string, merchandiseId: string, quantity: number }[]) {
  const cartId = (await cookies()).get('cartId')?.value;
  if (!cartId) return;

  await connectToDatabase();
  const cart = await Cart.findById(cartId);
  if (!cart) return;

  for (const updatedLine of lines) {
    const line = cart.lines.find((l: any) => l.id === updatedLine.id);
    if (line) {
      line.quantity = updatedLine.quantity;
    }
  }

  await cart.save();
}

export async function getMenu(handle: string): Promise<any[]> {
  if (handle === 'next-js-frontend-footer-menu') {
    return [
      { title: 'Home', path: '/' },
      { title: 'Contact Us', path: '/contact-us' },
      { title: 'About Us', path: '/about-us' },
      { title: 'Privacy Policy', path: '/privacy-policy' },
      { title: 'Terms & Conditions', path: '/terms-conditions' },
    ];
  }

  // Header menu
  return [
    { title: 'Home', path: '/' },
    { title: 'About', path: '/about-us' },
    { title: 'Contact', path: '/contact-us' },
    { title: 'Privacy Policy', path: '/privacy-policy' },
    { title: 'Terms & Conditions', path: '/terms-conditions' },
  ];
}

import Category from '../models/Category';

export async function getCollections(): Promise<any[]> {
  await connectToDatabase();
  const categories = await Category.find().lean();
  
  const formattedCategories = categories.map((cat: any) => ({
    title: cat.name,
    handle: cat.slug,
    path: `/search/${cat.slug}`
  }));

  return [
    { title: 'All Books', handle: '', path: '/search' },
    ...formattedCategories
  ];
}

export async function getProducts({ query, sortKey, reverse, categoryId }: { query?: string, sortKey?: string, reverse?: boolean, categoryId?: string } = {}): Promise<any[]> {
  await connectToDatabase();
  let filter: any = {};
  if (query) {
    filter.title = { $regex: query, $options: 'i' };
  }
  if (categoryId) {
    filter.categoryId = categoryId;
  }
  
  let sortConfig: any = { createdAt: -1 }; // default

  if (sortKey === 'PRICE') {
    sortConfig = { price: reverse ? -1 : 1 };
  } else if (sortKey === 'CREATED_AT') {
    sortConfig = { createdAt: reverse ? 1 : -1 };
  } else if (sortKey === 'BEST_SELLING') {
    sortConfig = { createdAt: -1 }; 
  }

  const books = await Book.find(filter as any).sort(sortConfig).lean();

  return books.map((book: any) => ({
    id: book._id.toString(),
    handle: book._id.toString(),
    title: book.title,
    description: book.description,
    descriptionHtml: `<p>${book.description}</p>`,
    availableForSale: true,
    priceRange: {
      maxVariantPrice: { amount: book.price.toString(), currencyCode: 'INR' },
      minVariantPrice: { amount: book.price.toString(), currencyCode: 'INR' }
    },
    featuredImage: { url: book.coverImage, altText: book.title, width: 1000, height: 1000 },
    images: [{ url: book.coverImage, altText: book.title, width: 1000, height: 1000 }],
    seo: { title: book.title, description: book.description },
    tags: [],
    updatedAt: book.updatedAt.toISOString(),
    pdfUrl: book.pdfUrl
  }));
}

export async function getCollection(handle: string): Promise<any> {
  await connectToDatabase();
  const cat = await Category.findOne({ slug: handle } as any).lean();
  if (!cat) return null;

  return {
    handle: cat.slug,
    title: cat.name,
    description: cat.description || `Collection of ${cat.name}`,
    seo: { title: cat.name, description: cat.description || '' },
    path: `/search/${cat.slug}`
  };
}

export async function getCollectionProducts({ collection, sortKey, reverse }: { collection: string, sortKey?: string, reverse?: boolean }): Promise<any[]> {
  await connectToDatabase();
  const cat = await Category.findOne({ slug: collection } as any).lean();
  if (!cat) return [];

  return getProducts({ sortKey, reverse, categoryId: cat._id.toString() });
}

import mongoose from 'mongoose';

export async function getProduct(handle: string): Promise<any> {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(handle)) return undefined;

  const book = await Book.findOne({ _id: handle } as any).lean();
  if (!book) return undefined;

  return {
    id: book._id.toString(),
    handle: book._id.toString(),
    title: book.title,
    description: book.description,
    descriptionHtml: `<p>${book.description}</p>`,
    availableForSale: true,
    priceRange: {
      maxVariantPrice: { amount: book.price.toString(), currencyCode: 'INR' },
      minVariantPrice: { amount: book.price.toString(), currencyCode: 'INR' }
    },
    featuredImage: { url: book.coverImage, altText: book.title, width: 1000, height: 1000 },
    images: [{ url: book.coverImage, altText: book.title, width: 1000, height: 1000 }],
    seo: { title: book.title, description: book.description },
    tags: [],
    updatedAt: book.updatedAt.toISOString(),
    pdfUrl: book.pdfUrl,
    variants: [{
      id: book._id.toString(),
      title: 'Default Title',
      availableForSale: true,
      selectedOptions: [{ name: 'Title', value: 'Default Title' }],
      price: { amount: book.price.toString(), currencyCode: 'INR' }
    }],
    options: [{
      id: 'default-option',
      name: 'Title',
      values: ['Default Title']
    }]
  };
}

export async function getProductRecommendations(id: string): Promise<any[]> {
  await connectToDatabase();

  let filter = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    filter = { _id: { $ne: id } };
  }

  const books = await Book.find(filter as any).limit(4).lean();

  return books.map((book: any) => ({
    id: book._id.toString(),
    handle: book._id.toString(),
    title: book.title,
    description: book.description,
    descriptionHtml: `<p>${book.description}</p>`,
    availableForSale: true,
    priceRange: {
      maxVariantPrice: { amount: book.price.toString(), currencyCode: 'INR' },
      minVariantPrice: { amount: book.price.toString(), currencyCode: 'INR' }
    },
    featuredImage: { url: book.coverImage, altText: book.title, width: 1000, height: 1000 },
    images: [{ url: book.coverImage, altText: book.title, width: 1000, height: 1000 }],
    seo: { title: book.title, description: book.description },
    tags: [],
    updatedAt: book.updatedAt.toISOString(),
    pdfUrl: book.pdfUrl
  }));
}

const staticPages: Record<string, { title: string; body: string; bodySummary: string; seo: { title: string; description: string } }> = {
  'about-us': {
    title: 'About Us',
    body: `
      <p class="lead">Welcome to <strong>PDF Store</strong>, your trusted destination for high-impact technical books, engineering guides, and developer learning resources.</p>
      <h2>Our Mission</h2>
      <p>We are dedicated to bridging the gap between cutting-edge technology and practical software engineering. Our mission is to empower developers, system architects, and technology enthusiasts worldwide with concise, high-value digital books and reference guides that accelerate learning and career progression.</p>
      <h2>What We Offer</h2>
      <ul>
        <li><strong>Curated Tech Library:</strong> Expertly crafted guides covering Web Development, Mobile Engineering, Cloud & DevOps, System Design, Data Science, AI, and Cybersecurity.</li>
        <li><strong>Instant Digital Access:</strong> Immediate access and downloads in high-fidelity PDF formats optimized for reading across desktops, tablets, and e-readers.</li>
        <li><strong>Real-World Focus:</strong> Actionable best practices, clean architectural blueprints, and production-ready code samples.</li>
        <li><strong>Continuous Updates:</strong> Content updated to reflect the latest framework releases and modern industry practices.</li>
      </ul>
      <h2>Commitment to Excellence</h2>
      <p>Every title in our collection is curated with the goal of saving you hundreds of hours of research by delivering direct, distilled expertise from experienced industry practitioners.</p>
      <h2>Connect With Us</h2>
      <p>Have questions, book recommendations, or partnership ideas? Feel free to reach out via our <a href="/contact-us">Contact Us</a> page.</p>
    `,
    bodySummary: 'Learn more about our mission, curated technical books, and commitment to developer education.',
    seo: {
      title: 'About Us - Technical Books & Developer Guides',
      description: 'Discover high-impact technical books and guides designed to accelerate your engineering career.',
    },
  },
  'contact-us': {
    title: 'Contact Us',
    body: `
      <p class="lead">We'd love to hear from you! Whether you have questions about our digital books, need assistance with your order, or are interested in partnership opportunities, our team is here to assist.</p>
      <h2>Customer Support</h2>
      <p>For immediate support regarding your purchases, downloads, or account access:</p>
      <ul>
        <li><strong>Email:</strong> support@eonpulsetech.com</li>
        <li><strong>Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM</li>
        <li><strong>Response Time:</strong> We typically respond to all inquiries within 24 business hours.</li>
      </ul>
      <h2>Business & Author Inquiries</h2>
      <p>If you represent an educational institution, enterprise team, or are an author interested in publishing with us:</p>
      <ul>
        <li><strong>General Inquiries:</strong> info@eonpulsetech.com</li>
        <li><strong>Enterprise Licensing:</strong> enterprise@eonpulsetech.com</li>
      </ul>
      <h2>Frequently Asked Questions</h2>
      <ul>
        <li><strong>How do I access my purchased books?</strong> Once your order is complete, you can download your PDF files directly from your profile or order confirmation.</li>
        <li><strong>Can I re-download my books later?</strong> Yes, you have lifetime access to your purchased books whenever you log in.</li>
      </ul>
    `,
    bodySummary: 'Get in touch with our support and editorial team for assistance, inquiries, and partnerships.',
    seo: {
      title: 'Contact Us - Customer Support & Inquiries',
      description: 'Contact our support and editorial team for any assistance regarding your digital book orders.',
    },
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    body: `
      <p class="lead">We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when using our platform.</p>
      <h2>1. Information We Collect</h2>
      <p>We collect information necessary to process your orders and provide a seamless reading experience:</p>
      <ul>
        <li><strong>Account Information:</strong> Name, email address, and encrypted credentials.</li>
        <li><strong>Transaction Details:</strong> Purchase history and digital download records.</li>
        <li><strong>Technical Information:</strong> IP address, device details, and browser type for security and diagnostic purposes.</li>
      </ul>
      <h2>2. How We Use Your Information</h2>
      <p>Your information is used exclusively to:</p>
      <ul>
        <li>Fulfill purchases and provide secure access to your PDF downloads.</li>
        <li>Authenticate user sessions and maintain account security.</li>
        <li>Send transaction receipts and critical service notices.</li>
        <li>Improve platform performance and customer support.</li>
      </ul>
      <h2>3. Data Protection & Security</h2>
      <p>We implement industry-standard encryption, SSL protocols, and access controls to keep your personal information safe. We never sell, rent, or trade your personal data to third parties.</p>
      <h2>4. Third-Party Integrations</h2>
      <p>We partner with trusted service providers (including Cloudinary for secure file delivery) strictly to deliver our store functionality under strict confidentiality standards.</p>
      <h2>5. Your Rights</h2>
      <p>You may request access to, correction of, or deletion of your personal data by contacting us at <a href="/contact-us">support@eonpulsetech.com</a>.</p>
    `,
    bodySummary: 'Read our Privacy Policy to understand how we protect and manage your personal data.',
    seo: {
      title: 'Privacy Policy',
      description: 'Our commitment to protecting your privacy and personal data.',
    },
  },
  'terms-conditions': {
    title: 'Terms and Conditions',
    body: `
      <p class="lead">Please read these Terms and Conditions carefully before using our website and purchasing digital books from our catalog.</p>
      <h2>1. Acceptance of Terms</h2>
      <p>By accessing our website, creating an account, or purchasing digital materials, you agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
      <h2>2. Digital Products & Licensing</h2>
      <p>All books, eBooks, guides, and accompanying code repositories available on this platform are protected by international copyright laws.</p>
      <ul>
        <li><strong>Personal License:</strong> Each purchase grants a non-exclusive, non-transferable personal license to view, read, and use the material for personal and professional education.</li>
        <li><strong>Prohibited Actions:</strong> You may not redistribute, resell, re-license, share download URLs publicly, or duplicate content without prior written permission.</li>
      </ul>
      <h2>3. Return & Refund Policy</h2>
      <p>Due to the immediate digital delivery of PDF files, digital purchases are generally non-refundable once downloaded. If you experience technical defects or accidental duplicate billing, please contact our support team within 14 days for assistance.</p>
      <h2>4. User Accounts & Security</h2>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account.</p>
      <h2>5. Limitation of Liability</h2>
      <p>The resources and materials provided on this platform are provided on an "as-is" basis without warranties of any kind. We are not liable for any damages resulting from the use or inability to use our digital products.</p>
      <h2>6. Changes to Terms</h2>
      <p>We reserve the right to modify these terms at any time. Continued use of the website indicates your acceptance of updated terms.</p>
    `,
    bodySummary: 'Review our terms of service, digital licensing, refund policies, and user agreements.',
    seo: {
      title: 'Terms and Conditions',
      description: 'Terms and conditions governing the use of our digital book store and licenses.',
    },
  },
};

// Aliases for alternate slug paths
if (staticPages['about-us']) staticPages['about'] = staticPages['about-us'];
if (staticPages['contact-us']) staticPages['contact'] = staticPages['contact-us'];
if (staticPages['privacy-policy']) staticPages['privacy'] = staticPages['privacy-policy'];
if (staticPages['terms-conditions']) {
  staticPages['terms'] = staticPages['terms-conditions'];
  staticPages['terms-and-conditions'] = staticPages['terms-conditions'];
  staticPages['terms-of-service'] = staticPages['terms-conditions'];
}

export async function getPage(handle: string): Promise<any> {
  if (handle === 'checkout') return null;

  const pageData = staticPages[handle];
  if (pageData) {
    return {
      id: handle,
      title: pageData.title,
      handle: handle,
      body: pageData.body,
      bodySummary: pageData.bodySummary,
      seo: pageData.seo,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    id: handle,
    title: handle.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    handle: handle,
    body: `<p>This is a page for ${handle.replace(/-/g, ' ')}.</p>`,
    bodySummary: `Page for ${handle.replace(/-/g, ' ')}`,
    seo: { title: handle, description: handle },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getPages(): Promise<any[]> {
  return [
    { handle: 'about-us', title: 'About Us', updatedAt: new Date().toISOString() },
    { handle: 'contact-us', title: 'Contact Us', updatedAt: new Date().toISOString() },
    { handle: 'privacy-policy', title: 'Privacy Policy', updatedAt: new Date().toISOString() },
    { handle: 'terms-conditions', title: 'Terms and Conditions', updatedAt: new Date().toISOString() },
  ];
}

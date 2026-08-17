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
  // Return dummy menu items to prevent crashes
  return [
    { title: 'All Books', path: '/search' },
    { title: 'Web Dev', path: '/search/web-development' },
    { title: 'Data Science', path: '/search/data-science-ai' },
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

export async function getPage(handle: string): Promise<any> {
  if (handle === 'checkout') return null;

  return {
    id: handle,
    title: handle.charAt(0).toUpperCase() + handle.slice(1),
    handle: handle,
    body: `<p>This is a dummy page for ${handle}.</p>`,
    bodySummary: `Dummy page for ${handle}`,
    seo: { title: handle, description: handle },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function getPages(): Promise<any[]> {
  return [];
}

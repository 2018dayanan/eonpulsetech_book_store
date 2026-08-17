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
        currencyCode: 'USD',
      },
      minVariantPrice: {
        amount: book.price.toString(),
        currencyCode: 'USD',
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
      cost: { totalAmount: { amount: lineCost.toString(), currencyCode: 'USD' } },
      merchandise: {
        id: book._id.toString(),
        title: 'Default Title',
        product: {
          title: book.title,
          handle: book._id.toString(),
          availableForSale: true,
          featuredImage: { url: book.coverImage, altText: book.title, width: 500, height: 500 },
          priceRange: {
            maxVariantPrice: { amount: book.price.toString(), currencyCode: 'USD' },
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
      subtotalAmount: { amount: subtotal.toString(), currencyCode: 'USD' },
      totalAmount: { amount: subtotal.toString(), currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
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

export async function getCollections(): Promise<any[]> {
  // Return dummy collections
  return [
    { title: 'All Books', handle: '', path: '/search' },
    { title: 'Web Dev', handle: 'web-development', path: '/search/web-development' },
  ];
}

export async function getProducts({ query, sortKey, reverse }: { query?: string, sortKey?: string, reverse?: boolean } = {}): Promise<any[]> {
  await connectToDatabase();
  let filter = {};
  if (query) {
    filter = { title: { $regex: query, $options: 'i' } };
  }
  const books = await Book.find(filter as any).lean();

  return books.map((book: any) => ({
    id: book._id.toString(),
    handle: book._id.toString(),
    title: book.title,
    description: book.description,
    descriptionHtml: `<p>${book.description}</p>`,
    availableForSale: true,
    priceRange: {
      maxVariantPrice: { amount: book.price.toString(), currencyCode: 'USD' },
      minVariantPrice: { amount: book.price.toString(), currencyCode: 'USD' }
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
  // Dummy collection return
  return {
    handle,
    title: handle.replace('-', ' '),
    description: `Collection of ${handle}`,
    seo: { title: handle, description: '' },
    path: `/search/${handle}`
  };
}

export async function getCollectionProducts({ collection, sortKey, reverse }: { collection: string, sortKey?: string, reverse?: boolean }): Promise<any[]> {
  // For now just return all products since we don't have populate ready
  return getProducts();
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
      maxVariantPrice: { amount: book.price.toString(), currencyCode: 'USD' },
      minVariantPrice: { amount: book.price.toString(), currencyCode: 'USD' }
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
      price: { amount: book.price.toString(), currencyCode: 'USD' }
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
      maxVariantPrice: { amount: book.price.toString(), currencyCode: 'USD' },
      minVariantPrice: { amount: book.price.toString(), currencyCode: 'USD' }
    },
    featuredImage: { url: book.coverImage, altText: book.title, width: 1000, height: 1000 },
    images: [{ url: book.coverImage, altText: book.title, width: 1000, height: 1000 }],
    seo: { title: book.title, description: book.description },
    tags: [],
    updatedAt: book.updatedAt.toISOString(),
    pdfUrl: book.pdfUrl
  }));
}

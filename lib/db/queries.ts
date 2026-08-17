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

export async function getCart(): Promise<any> {
  // Stub for now, returns an empty cart to avoid Shopify errors
  return {
    id: 'mock-cart-id',
    checkoutUrl: '#',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
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

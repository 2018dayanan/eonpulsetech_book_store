# Next.js E-Commerce & Admin Platform

A modern, high-performance e-commerce storefront and comprehensive admin dashboard built with Next.js 15, React 19, Tailwind CSS, and MongoDB.

## Features

### Storefront
- **Next.js 15 App Router**: Blazing fast server-side rendering and static site generation.
- **Responsive Design**: Beautiful mobile-first UI using Tailwind CSS.
- **Search & Discovery**: Integrated product search and dynamic category navigation.
- **Cart Management**: Seamless shopping cart experience.

### Admin Dashboard (`/admin`)
- **Secure Authentication**: Protected admin routes using JWT (`jose`) and secure password hashing (`bcryptjs`).
- **Product Management**: Full CRUD capabilities for managing Books/Products.
- **Category Management**: Create, edit, and delete store categories with automatic cache revalidation.
- **User & Order Management**: Interfaces for tracking customers and fulfilling orders.
- **Responsive Layout**: Mobile-friendly sidebar navigation with a slide-out hamburger menu.
- **Database Integration**: Powered by MongoDB/Mongoose for reliable data storage.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions, Turbopack)
- **Frontend**: React 19, Tailwind CSS v4, Headless UI, HeroIcons
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT (Jose), bcryptjs
- **Typography**: Geist Sans

## Getting Started

### Prerequisites

- Node.js 18+ (or compatible version)
- MongoDB Database (Local or MongoDB Atlas)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd book
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Environment Variables**:
   Copy the example environment file and fill in your values.
   ```bash
   cp .env.example .env
   ```
   *Make sure to include your `MONGODB_URI` and any necessary Shopify/Storefront API keys if applicable.*

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will start with Turbopack for ultra-fast compilation.

5. **Open the Application**:
   - **Storefront**: [http://localhost:3000](http://localhost:3000)
   - **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

## Scripts

- `npm run dev`: Starts the Next.js development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run prettier`: Formats code automatically.

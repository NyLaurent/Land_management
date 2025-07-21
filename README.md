# 🏡 Land Management System

A modern, responsive web application for managing land registrations and transfers built with Next.js 15, Supabase, and beautiful UI components.

## 🌐 Live Demo

**Try it now:** [https://land-management-six.vercel.app/](https://land-management-six.vercel.app/)

Experience the full application with all features including authentication, land registration, and transfer management.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password signup and signin
- 📊 **Dashboard** - Overview of land registrations and transfers
- 🏗️ **Land Registration** - Register new land parcels with detailed information
- 🔄 **Transfer Management** - Create and track land ownership transfers
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🎨 **Modern UI** - Clean, minimal design with smooth animations
- 🔒 **Secure Data** - Row-level security with Supabase

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Supabase account** - [Sign up here](https://supabase.com/)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd rwanda_land

# Install dependencies
npm install
```

### 2. Supabase Setup

#### Create a new Supabase project:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization and set project details
4. Wait for the project to be created

#### Create Database Tables:

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable RLS
alter table if exists public.lands enable row level security;
alter table if exists public.transfers enable row level security;

-- Create lands table
create table public.lands (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  parcel_id text not null unique,
  size text not null,
  location text not null,
  ownership_type text not null,
  status text default 'pending' not null,
  documents text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transfers table
create table public.transfers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  land_id uuid references public.lands(id) on delete cascade not null,
  parcel_id text not null,
  transferee_name text not null,
  transferee_email text not null,
  transfer_type text not null,
  reason text,
  status text default 'pending' not null,
  documents text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for lands
create policy "Users can view their own lands" on public.lands
  for select using (auth.uid() = user_id);

create policy "Users can insert their own lands" on public.lands
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own lands" on public.lands
  for update using (auth.uid() = user_id);

create policy "Users can delete their own lands" on public.lands
  for delete using (auth.uid() = user_id);

-- RLS Policies for transfers
create policy "Users can view their own transfers" on public.transfers
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transfers" on public.transfers
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own transfers" on public.transfers
  for update using (auth.uid() = user_id);

create policy "Users can delete their own transfers" on public.transfers
  for delete using (auth.uid() = user_id);
```

### 3. Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to find these values:**

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the **Project URL** and **anon/public key**

### 4. Run the Application

```bash
# Start the development server
npm run dev

# Open your browser to:
# http://localhost:3000
```

## 📖 How to Use

### Getting Started

1. **Visit the landing page** at `http://localhost:3000`
2. **Sign up** with your email, first name, last name, and password
3. **Sign in** to access your dashboard

### Managing Land

1. **Dashboard** - View overview of your registrations and transfers
2. **Register Land** - Click "Register New Land" to add a new parcel
3. **View Lands** - See all your registered lands in "My Land" section

### Transfer Management

1. **Create Transfer** - Go to "Transfers" and click "Create Transfer"
2. **Select Parcel** - Choose from your registered land parcels
3. **Enter Details** - Add transferee information and transfer type
4. **Track Status** - Monitor transfer progress in the transfers table

## 🛠️ Tech Stack

- **Framework:** Next.js 15 with Turbopack
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

## 📱 Responsive Design

The application is fully responsive and works on:

- 📱 Mobile devices (phones)
- 📟 Tablets
- 💻 Desktop computers
- 🖥️ Large screens

## 🔧 Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🐛 Troubleshooting

### Common Issues:

**❌ "Failed to fetch" errors:**

- Check your Supabase URL and keys in `.env.local`
- Ensure your Supabase project is running

**❌ Authentication not working:**

- Verify RLS policies are created correctly
- Check your Supabase Auth settings

**❌ Data not persisting:**

- Ensure database tables are created with correct schema
- Verify RLS policies allow your operations

**❌ Build errors:**

- Run `npm run lint` to check for issues
- Ensure all TypeScript errors are resolved

### Need Help?

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review [Next.js Documentation](https://nextjs.org/docs)
3. Ensure all environment variables are set correctly

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy Land Management! 🏡✨**

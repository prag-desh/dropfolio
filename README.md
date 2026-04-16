# 💧 Dropfolio

A full-stack web application where vibe coders share their deployed projects. Built with React, Vite, Supabase, and Tailwind CSS.

## 🚀 Features

- **Authentication**: Email/password signup/login via Supabase auth
- **Project Sharing**: Drop your deployed projects with name, category, description, and URL
- **Public Profiles**: All profiles are public - view anyone's projects and profile info
- **Endless Scroll Home Feed**: Discover projects from all users in a beautiful card layout
- **Comments**: Anyone logged in can comment on projects
- **Responsive Design**: Mobile-first with desktop navbar and mobile bottom navigation
- **Dark Theme**: Modern Gen Z aesthetic with purple accent colors

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Deployment**: Ready for Vercel

## 📁 Project Structure

```
src/
├── components/
│   └── Navbar.tsx          # Responsive navigation
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── lib/
│   └── supabase.ts         # Supabase client and types
├── pages/
│   ├── Auth.tsx            # Login/Signup page
│   ├── Home.tsx            # Home feed with endless scroll
│   ├── Drop.tsx            # Project submission form
│   ├── Profile.tsx         # User's own profile (editable)
│   ├── UserProfile.tsx     # Public profile view
│   └── ProjectDetail.tsx   # Project details + comments
├── App.tsx                 # Main app with routing
└── main.tsx               # App entry point
```

## 🗄️ Database Schema

### Profiles Table
- `id` (UUID, Primary Key)
- `username` (Text, Unique)
- `bio` (Text, Optional)
- `college` (Text, Optional)
- `github_url` (Text, Optional)
- `instagram_url` (Text, Optional)
- `avatar_url` (Text, Optional)
- `created_at` (Timestamp)

### Projects Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `name` (Text)
- `category` (Text: Tech, Health, Education, Finance, Entertainment, Productivity, Other)
- `description` (Text, max 200 chars)
- `deployed_url` (Text, URL)
- `created_at` (Timestamp)

### Comments Table
- `id` (UUID, Primary Key)
- `project_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `content` (Text)
- `created_at` (Timestamp)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd dropfolio
npm install
```

### 2. Set Up Supabase

1. Create a new project in [Supabase Dashboard](https://supabase.com/dashboard)
2. Run the SQL from `supabase-schema.sql` in the Supabase SQL Editor
3. Get your project URL and anon key from Settings > API
4. Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## 🌐 Deployment (Vercel)

1. Push your code to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

## 📱 Routes

- `/` - Home feed (public)
- `/drop` - Submit project (requires auth)
- `/profile` - Your profile (requires auth)
- `/u/:username` - Public profile (public)
- `/project/:id` - Project details (public, comments require auth)
- `/auth` - Login/Signup (public)

## 🎨 Design System

- **Colors**: Dark theme with purple accents
- **Typography**: System fonts for performance
- **Components**: Custom Tailwind components (`.btn-primary`, `.card`, `.input-field`)
- **Responsive**: Mobile-first with breakpoints at md (768px) and lg (1024px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🆘 Troubleshooting

### Tailwind CSS not working
- Make sure you've installed the dependencies
- Check that `tailwind.config.js` and `postcss.config.js` are properly configured
- Restart your dev server

### Supabase connection issues
- Verify your environment variables are correctly set
- Check that your Supabase project is active
- Ensure RLS policies are properly configured

### Build errors
- Make sure all dependencies are installed
- Check TypeScript types in `vite-env.d.ts`
- Verify all imports are correct

---

Built with 💧 by the community, for the community.

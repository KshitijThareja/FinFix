<div align="center">

  <h1>
    <img src="static/icon.svg" width="90" height="90" alt="FinFix Logo"/><br/>
    FinFix
  </h1>

> FinFix is a comprehensive loan management application that helps users create, track, and manage loan repayments through an intuitive interface with powerful calculation features.

  <p>
    <a href="https://github.com/your-username/finfix/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="FinFix is released under the MIT license." />
    </a>
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#project-structure">Project Structure</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

##  Features

## 📊 Dynamic Loan Management
- Create and manage detailed loan repayment schedules
- Configure based on principal amount, interest rate, tenure, and more
- Support for different EMI frequencies and moratorium periods
- Real-time schedule generation

## 🔐 User Authentication & Security
- Secure login and registration with Supabase
- Row-level security for data protection
- User-specific loan management

## 🎨 Modern User Experience
- **Responsive design** for all devices
- **Dark/Light mode** support
- **Intuitive dashboard** for loan overview
- **Data visualization** with interactive charts

## 📤 Export & Sharing
- **Export loan schedules** as CSV files
- **Print-friendly layouts** for documentation
- **Data persistence** with PostgreSQL backend

---

## Tech Stack

### 🖥️ Frontend
- **Framework:** [Next.js](https://nextjs.org)
- **UI Library:** [React](https://reactjs.org)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Components:** [Shadcn/UI](https://ui.shadcn.com/)
- **Charts:** [Recharts](https://recharts.org)

### 🔧 Backend
- **Runtime:** [Node.js](https://nodejs.org)
- **API Framework:** [Express.js](https://expressjs.com)
- **Authentication & DB:** [Supabase](https://supabase.com)
- **Database:** PostgreSQL (via Supabase)

### 🛠️ Development
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Hosting:** [Vercel](https://vercel.com) (Frontend) & [Render](https://render.com) (Backend)

---

### ⚡ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/finfix.git
   cd finfix
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Create a Supabase project**
   - Sign up at [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key from the project settings
   
4. **Set up frontend environment variables**
   - Create a `.env.local` file in the frontend directory
     ```env
     NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
     NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     ```

5. **Set up backend environment variables**
   - Create a `.env` file in the backend directory
     ```env
     PORT=8000
     SUPABASE_URL=your-supabase-url
     SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
     FRONTEND_URL=http://localhost:3000
     ```

6. **Run the frontend development server**
   ```bash
   npm run dev
   ```

7. **Run the backend server**
   ```bash
   cd ../backend
   npm install
   npx tsc
   npx ts-node src/api/index.ts
   ```

8. **Open your browser**
   - Navigate to `http://localhost:3000` to see the application

## Project Structure

```
finfix/
├── frontend/              # Next.js frontend
│   ├── app/               # Next.js App Router pages and components
│   │   ├── loans/         # Loan-related pages
│   │   └── components/    # Reusable UI components
│   ├── utils/             # Utility functions
│   ├── public/            # Static assets
│   ├── next.config.js     # Next.js configuration
│   └── package.json       # Frontend dependencies
├── backend/               # Express.js backend
│   ├── src/               # Source files
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
└── README.md              # Documentation
```

## Contributing

We welcome contributions to FinFix! Here's how you can help:

1. **Fork the Repository**
2. **Create a Feature Branch:** `git checkout -b feature/your-feature-name`
3. **Make Changes:** Follow coding standards and update tests if needed
4. **Commit Changes:** `git commit -m "Add feature: [description]"`
5. **Push and Submit a Pull Request**
6. **Code Review:** We'll review your PR and provide feedback

## Acknowledgments

- Supabase for providing an excellent backend solution
- The open-source community for the amazing tools and libraries
- Vercel and Render for hosting options

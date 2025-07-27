# 🚀 HireFlow - Modern Recruitment Dashboard

A modern React TypeScript application for managing recruitment campaigns and candidate tracking with AI-powered automation.

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## ✨ Features

- **�️ Modern Dashboard**: Clean, responsive interface built with React & TypeScript
- **🔐 Google OAuth**: Secure authentication with Google Sign-In
- **📊 Campaign Management**: Create and manage job campaigns with detailed tracking
- **� Kanban Board**: Drag-and-drop candidate pipeline management
- **💬 Communication Hub**: WhatsApp-style messaging interface
- **🎯 Candidate Tracking**: Comprehensive candidate management system
- **📄 Bulk Import**: CSV upload for bulk candidate import
- **🌙 Dark Mode**: Beautiful dark/light theme switching
- **🗄️ Database Integration**: Serverless PostgreSQL with Neon
- **� Fast Deployment**: One-click deployment to Netlify

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS, Lucide Icons
- **Database**: Neon PostgreSQL (Serverless)
- **Authentication**: Google OAuth 2.0
- **Hosting**: Netlify
- **Drag & Drop**: @dnd-kit
- **Forms**: React Hook Form
- **Routing**: React Router v7

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Console account (for OAuth)
- Neon Database account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Abhijeet17o/hireflow.git
   cd hireflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   VITE_DATABASE_URL=your-neon-database-url
   VITE_APP_NAME=HireFlow
   VITE_APP_URL=http://localhost:5173
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit** `http://localhost:5173`

## 🌐 Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Abhijeet17o/hireflow)

1. **Fork this repository** on GitHub
2. **Click the Deploy button** above
3. **Add environment variables** in Netlify dashboard:
   ```
   VITE_DATABASE_URL=your-neon-database-url
   VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
   VITE_APP_URL=https://your-site.netlify.app
   ```

## 📱 Usage

### For Recruiters

1. **🔐 Sign in** with Google account
2. **📝 Complete onboarding** with company details  
3. **🎯 Create campaigns** with detailed job descriptions
4. **👥 Add candidates** manually or via CSV upload
5. **📊 Track progress** through Kanban pipeline
6. **💬 Communicate** via messaging hub

---

**Made with ❤️ for modern recruitment teams**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Abhijeet17o/hireflow)
├── pages/               # Main application pages
│   ├── Dashboard.tsx    # Campaign overview dashboard
│   ├── CreateCampaign.tsx # New campaign creation
│   └── CampaignDetail.tsx # Campaign details with Kanban
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types and interfaces
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## API Integration Ready

The application is designed to integrate with:
- **Backend API**: REST or GraphQL endpoints
- **Email Services**: Azure Communication Services
- **AI Services**: RAG-powered response generation
- **File Storage**: Resume and document management

## Development Features

- **Hot Module Replacement**: Instant development updates
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint and Prettier configured
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components

## Customization

### Adding New Stages
Modify the stages array in campaign data to add custom recruitment stages.

### Styling
Update TailwindCSS configuration in `tailwind.config.js` for custom theming.

### Forms
Extend form schemas using React Hook Form for additional fields.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

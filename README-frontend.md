# 🚀 HireFlow - Modern Recruitment Dashboard

A modern React TypeScript application for managing recruitment campaigns and candidate tracking with AI-powered automation.

![HireFlow Demo](https://your-demo-image-url.com)

## ✨ Features

- **🏗️ Modern Dashboard**: Clean, responsive interface built with React & TypeScript
- **🔐 Google OAuth**: Secure authentication with Google Sign-In
- **📊 Campaign Management**: Create and manage job campaigns with detailed tracking
- **📱 Kanban Board**: Drag-and-drop candidate pipeline management
- **💬 Communication Hub**: WhatsApp-style messaging interface
- **🎯 Candidate Tracking**: Comprehensive candidate management system
- **📄 Bulk Import**: CSV upload for bulk candidate import
- **🌙 Dark Mode**: Beautiful dark/light theme switching

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
   git clone https://github.com/Abhijeet17o/hireflow-frontend.git
   cd hireflow-frontend
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

## 🌐 Deployment

### Deploy to Netlify

1. **Connect to GitHub**
   - Link your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   Add these in Netlify dashboard:
   ```
   VITE_DATABASE_URL=your-neon-database-url
   VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
   VITE_APP_URL=https://your-site.netlify.app
   ```

3. **Google OAuth Setup**
   - Add your Netlify domain to Google Console
   - Update authorized redirect URIs

### Database Setup (Neon)

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Get your connection string
3. The app will automatically create the users table on first run

## 📱 Usage

### For Recruiters

1. **Sign in** with Google account
2. **Complete onboarding** with company details
3. **Create campaigns** with detailed job descriptions
4. **Add candidates** manually or via CSV upload
5. **Track progress** through the Kanban pipeline
6. **Communicate** with candidates via the messaging hub

### For Candidates

- Simple, clean interface for job applications
- Real-time status updates
- Direct communication with recruiters

## 🎨 Screenshots

### Dashboard
![Dashboard](https://your-screenshot-url.com)

### Campaign Creation
![Campaign Creation](https://your-screenshot-url.com)

### Kanban Pipeline
![Kanban Pipeline](https://your-screenshot-url.com)

### Communication Hub
![Communication Hub](https://your-screenshot-url.com)

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins

### Database Schema

The app automatically creates this table structure:

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture TEXT,
  verified_email BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 Email: support@hireflow.com
- 💬 Discord: [Join our community](https://discord.gg/hireflow)
- 📖 Documentation: [docs.hireflow.com](https://docs.hireflow.com)

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) for lightning-fast development
- UI components inspired by modern design systems
- Icons by [Lucide](https://lucide.dev/)
- Hosted on [Netlify](https://netlify.com/)
- Database by [Neon](https://neon.tech/)

---

**Made with ❤️ by the HireFlow team**

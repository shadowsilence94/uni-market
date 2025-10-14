# 🛒 Uni-Market

**Peer-to-peer marketplace for the Asian Institute of Technology (AIT) community**

A comprehensive web application built with React, Node.js, and Express that enables AIT students, faculty, and staff to buy, sell, and trade items and services within the community.

---

## ✨ Features

### For Users
- 🔐 **User Authentication** - Secure registration and login with JWT
- 👤 **Profile Management** - Edit profile, upload profile picture
- ✓ **Verification System** - Request verification badge with proof of identity
- 🛍️ **Buy & Sell** - List products and services with images
- 💰 **Thai Baht Currency** - All prices in ฿ (1 USD = 35 THB)
- 🔍 **Search & Filter** - Find items by category, search terms
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Smooth Animations** - Framer Motion for polished UX

### For Admins
- 👥 **User Management** - Add, delete, verify users
- ✓ **Verification Requests** - Review and approve identity verification
- 📦 **Item Management** - Monitor and remove listings
- 📊 **Analytics Dashboard** - View statistics and insights
- 📢 **Broadcast Notifications** - Send announcements to users

### Security & Privacy
- 🔒 Contact information hidden until login
- 🎓 AIT email certification (@ait.asia)
- 🛡️ Admin-only protected routes
- 🔑 Password hashing with bcrypt

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/uni-market.git
cd uni-market
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. **Start the backend**
```bash
cd server
npm start
# Server runs on http://localhost:3001
```

4. **Start the frontend** (in new terminal)
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

5. **Open browser**
```
http://localhost:5173
```

### Test Credentials
```
Admin: st126010@ait.asia / Htutkoko@17
User:  user@ait.asia / password
```

---

## 📦 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **JSON file** - Database (demo)

---

## 🌐 Deployment

### Quick Deploy (10 minutes)

**See detailed instructions in:**
- `GITHUB_SETUP.md` - Push code to GitHub
- `QUICK_DEPLOY.md` - Deploy to Render + Vercel

**Or run the setup script:**
```bash
./setup-github.sh
```

### Recommended Hosting
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel.com (Free tier)

---

## 📁 Project Structure

```
uni-market/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth context
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Express backend
│   ├── index.js          # Main server file
│   ├── db.json           # JSON database
│   └── package.json
├── GITHUB_SETUP.md       # GitHub setup guide
├── QUICK_DEPLOY.md       # Deployment guide
└── README.md             # This file
```

---

## 🎯 Key Features Explained

### Currency System
- Prices stored in USD backend
- Displayed in Thai Baht (฿) frontend
- Conversion rate: 1 USD = 35 THB

### Verification System
- Users upload proof of identity
- Admins review in dashboard
- Approved users get ✓ badge

### Privacy Protection
- Unregistered users can browse
- Must login to see seller contact info
- Protects user privacy

### Admin Dashboard
- User management (add/delete/verify)
- Item management (view/delete)
- Verification requests review
- Analytics and statistics
- Broadcast notifications

---

## 🔧 Configuration

### Environment Variables

**Backend** (`server/.env`):
```env
PORT=3001
JWT_SECRET=your-secret-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`client/vite.config.ts`):
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (admin)
- `POST /api/users` - Add user (admin)

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create item
- `DELETE /api/items/:id` - Delete item

### Verification
- `POST /api/verification-requests` - Submit request
- `GET /api/verification-requests` - Get all (admin)
- `PUT /api/verification-requests/:id/approve` - Approve
- `PUT /api/verification-requests/:id/reject` - Reject

---

## 🤝 Contributing

This is a student project for the AIT community. Contributions are welcome!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📄 License

MIT License - feel free to use for educational purposes

---

## 👨‍💻 Developer

**HTUT KO KO**  
Student ID: st126010  
Asian Institute of Technology

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: st126010@ait.asia

---

## 🙏 Acknowledgments

- Asian Institute of Technology
- AIT Community
- Open source libraries used in this project

---

**Made with ❤️ for the AIT Community**

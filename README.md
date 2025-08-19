# 🤝 Humanity - Donation Management System

A comprehensive donation management platform built with React and Node.js, featuring real-time updates, UPI payment integration, and Excel-based data persistence.

## 🌟 Features

### 💰 Donation Management
- **Real-time donation tracking** with live updates
- **UPI payment integration** for seamless transactions
- **Donation verification** with UTR (Unique Transaction Reference) validation
- **Multi-story support** with individual donation tracking

### 📊 Admin Dashboard
- **Real-time statistics** and analytics
- **Donation monitoring** with status updates
- **Story management** with media upload support
- **Collaboration request handling**

### 🔄 Data Synchronization
- **Excel file integration** for data persistence
- **Bidirectional sync** between web interface and Excel files
- **Automatic backups** with timestamp-based versioning
- **Real-time file watching** for external Excel updates

### 🎨 User Interface
- **Responsive design** for mobile and desktop
- **Interactive donation flow** with step-by-step guidance
- **Real-time notifications** via WebSocket
- **Modern UI/UX** with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/humanity-donation-system.git
   cd humanity-donation-system
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies (root, backend, and frontend)
   npm run install:all
   ```

3. **Environment Setup**
   
   Create `.env` files in both Backend and Frontend directories:
   
   **Backend/.env:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/humanity
   JWT_SECRET=your_jwt_secret_here
   ```
   
   **Frontend/.env:**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

### 🏃‍♂️ Running the Application

#### Development Mode (Recommended)
```bash
# Run both frontend and backend simultaneously
npm run dev
```

#### Individual Services
```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

#### Production Mode
```bash
# Build and start production server
npm run build
npm start
```

### 📱 Access URLs
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5000/admin
- **Interactive Demo**: http://localhost:5000

## 🏗️ Project Structure

```
humanity-donation-system/
├── Frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── services/        # API service functions
│   │   ├── config/          # Configuration files
│   │   └── ...
│   ├── public/              # Static assets
│   └── package.json
├── Backend/                 # Node.js backend server
│   ├── controllers/         # Route controllers
│   ├── models/              # Data models
│   ├── routes/              # API routes
│   ├── services/            # Business logic services
│   ├── data/                # Excel data files
│   ├── uploads/             # File uploads
│   └── server.js            # Main server file
├── docs/                    # Documentation
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
├── README.md               # This file
└── package.json            # Root package configuration
```

## 🔧 Configuration

### Payment Gateway Setup
The system supports UPI payments. Configure your UPI ID in the backend:

```javascript
// Backend/services/paymentGateway.js
const UPI_ID = "your-upi-id@bank";
```

### Excel Data Files
The system automatically creates and manages Excel files in `Backend/data/`:
- `donations.xlsx` - Donation records
- `stories.xlsx` - Story/campaign data
- `collaborations.xlsx` - Partnership requests
- `status_updates.xlsx` - System status logs

## 📊 API Endpoints

### Donations
- `GET /api/donations` - Get all donations
- `POST /api/donations` - Create new donation
- `PUT /api/donations/:id` - Update donation status

### Stories
- `GET /api/stories` - Get all stories
- `POST /api/stories` - Create new story
- `PUT /api/stories/:id` - Update story

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/collaborations` - Get collaboration requests
- `POST /api/admin/collaborations` - Handle collaboration requests

## 🔄 Real-time Features

The application uses WebSocket for real-time updates:
- Live donation notifications
- Real-time statistics updates
- Instant data synchronization
- Live Excel file monitoring

## 🛡️ Security Features

- Input validation and sanitization
- File upload restrictions
- CORS configuration
- Environment variable protection
- Secure payment handling

## 📱 Mobile Responsiveness

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/) folder
2. Search existing issues on GitHub
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- React team for the amazing frontend framework
- Node.js community for the robust backend platform
- All contributors who helped improve this project

## 📈 Roadmap

- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Payment gateway integration expansion
- [ ] Automated email notifications
- [ ] Advanced reporting features

---

**Made with ❤️ for humanity**
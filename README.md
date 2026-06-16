# ReadyNest Task 1 - Dynamic Form Builder

![ReadyNest Form Builder](https://img.shields.io/badge/ReadyNest-Task%201-blue?style=for-the-badge)

**Developed by: Ayush Sinha**

## 🚀 Overview

ReadyNest Task 1 is a comprehensive Full-Stack Dynamic Form Builder application. It allows users to create, manage, and distribute custom forms effortlessly. With a powerful drag-and-drop builder, real-time analytics, and a beautiful UI, this platform is designed to make data collection seamless and professional.

## ✨ Features

- **Drag-and-Drop Form Builder**: Easily construct forms by dragging various input fields (Text, Email, Dropdown, Radio, Checkbox, etc.).
- **Dashboard & Analytics**: Track responses in real-time with visually appealing charts and metrics.
- **Public Form Sharing**: Generate unique public links and QR codes for easy sharing.
- **Data Export**: Download all form responses directly as a CSV file.
- **Authentication System**: Secure user registration and login using JWT.
- **Draft & Publish Mode**: Work on your forms in draft mode and publish them when ready.
- **Responsive Design**: Beautiful and fully responsive UI built with Tailwind CSS, accessible on any device.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons), React Router, React Hook Form, Zustand (State Management)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ayushsinha008/readynest-task1.git
   cd readynest-task1
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   # Create a .env file with PORT, MONGO_URI, and JWT_SECRET
   npm run dev
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../client
   npm install
   # Create a .env file with VITE_API_URL pointing to your backend
   npm run dev
   ```

## 👨‍💻 Author

**Ayush Sinha**  
*Website Developer & Engineer*

---
*Built with ❤️ for ReadyNest.*

# ReadyNest Task 1 - Dynamic Form Builder

![ReadyNest Form Builder](https://img.shields.io/badge/ReadyNest-Task%201-blue?style=for-the-badge)

**Developed by: Ayush Sinha**

## Overview

ReadyNest Task 1 is a comprehensive, full-stack dynamic form builder platform. Designed for both individuals and businesses, it allows users to effortlessly create, manage, and distribute custom forms without writing a single line of code. 

With a powerful drag-and-drop builder, creators can customize their forms with various field types, validation rules, and aesthetic themes. Once published, forms can be easily shared via unique public links or generated QR codes. The platform also features a robust analytics dashboard where users can track form views, monitor conversion rates, and export all respondent data directly into a CSV format for offline analysis.

The application is built with modern, responsive design principles to ensure a seamless and intuitive experience across desktops, tablets, and mobile devices.

## Key Features

- **Drag-and-Drop Form Builder**: Easily construct forms by dragging various input fields (Text, Email, Dropdown, Radio, Checkbox, etc.).
- **Dashboard & Analytics**: Track responses in real-time with visually appealing charts and metrics.
- **Respondent Tracking**: Mandates email entry before a form is loaded, allowing you to accurately track who submitted a response.
- **Public Form Sharing**: Generate unique public links and QR codes for easy sharing.
- **Data Export**: Download all form responses directly as a CSV file.
- **Authentication System**: Secure user registration and login using JWT.
- **Draft & Publish Mode**: Work on your forms in draft mode and publish them when ready.
- **Responsive Design**: Beautiful and fully responsive UI built with Tailwind CSS, accessible on any device.

## Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons), React Router, React Hook Form, Zustand (State Management)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

## Installation & Setup

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

## Author

**Ayush Sinha**  
*Website Developer & Engineer*

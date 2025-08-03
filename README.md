<<<<<<< HEAD
# Book Review Management System

A full-stack web application for managing book reviews, built with HTML, CSS, JavaScript, Node.js, and MySQL.

## 🌟 Features

### Frontend
- **User Authentication**: Registration and login system with JWT tokens
- **Responsive Design**: Modern UI that works on desktop, tablet, and mobile
- **Book Management**: View, add, edit, and delete books (admin only)
- **Review System**: Write reviews with star ratings and image uploads
- **Comment System**: Add comments to reviews
- **User Profiles**: Edit user information and view profile
- **Admin Panel**: Statistics dashboard and user management

### Backend
- **RESTful API**: Complete CRUD operations for all entities
- **Database**: MySQL with proper relationships and constraints
- **Authentication**: JWT-based authentication with role-based access
- **Security**: SQL injection prevention, password hashing
- **Error Handling**: Comprehensive error handling and validation

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3 (with modern features like Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons

### Backend
- Node.js
- Express.js
- MySQL
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- cors (Cross-Origin Resource Sharing)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MySQL](https://www.mysql.com/) (v8.0 or higher)
- [Git](https://git-scm.com/)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sharifuzofc/Book-Review-Management-System.git
   cd Book-Review-Management-System
   ```

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up the database**
   - Create a MySQL database named `auth_system`
   - Update the `.env` file in the server directory with your database credentials

4. **Configure environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=auth_system
   ```

5. **Initialize the database**
   - Start the server: `node app.js`
   - Visit `http://localhost:5000/init` in your browser to create tables and sample data

## 🎯 Usage

### Starting the Application

1. **Start the server**
   ```bash
   cd server
   node app.js
   ```

2. **Open the application**
   - Open `public/index.html` in your browser
   - Or serve the public folder using a local server

### Default Admin Account
- **Email**: admin@example.com
- **Password**: admin123

### Features Walkthrough

1. **Registration/Login**: Create a new account or login with existing credentials
2. **Dashboard**: Navigate between Books, Profile, and Admin sections
3. **Books Section**: View all books, click on a book to see details
4. **Add Books**: Admin users can add new books with cover images
5. **Reviews**: Write reviews with star ratings and optional images
6. **Comments**: Add comments to reviews
7. **Profile**: Edit your profile information
8. **Admin Panel**: View statistics and manage users (admin only)

## 📁 Project Structure

```
Book-Review-Management-System/
├── public/
│   ├── index.html          # Main HTML file
│   ├── style.css           # CSS styles
│   └── script.js           # Frontend JavaScript
├── server/
│   ├── app.js              # Main server file
│   ├── package.json        # Node.js dependencies
│   └── .env                # Environment variables
├── .gitignore              # Git ignore file
└── README.md               # Project documentation
```

## 🗄️ Database Schema

### Tables
- **users**: User accounts and authentication
- **books**: Book information and metadata
- **reviews**: User reviews with ratings
- **comments**: Comments on reviews
- **images**: Images associated with reviews

### Relationships
- Users can have multiple reviews
- Books can have multiple reviews
- Reviews can have multiple comments and images
- Proper foreign key constraints with CASCADE deletion

## 🔧 API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login

### Books
- `GET /books` - Get all books
- `GET /books/:id` - Get book with reviews
- `POST /books` - Create new book (admin only)
- `PUT /books/:id` - Update book (admin only)
- `DELETE /books/:id` - Delete book (admin only)

### Reviews
- `POST /books/:id/reviews` - Add review to book
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Comments
- `POST /reviews/:id/comments` - Add comment to review
- `GET /reviews/:id/comments` - Get comments for review
- `DELETE /comments/:id` - Delete comment

### Images
- `POST /reviews/:id/images` - Add image to review
- `GET /reviews/:id/images` - Get images for review
- `DELETE /images/:id` - Delete image

### User Management
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /dashboard` - Get dashboard data

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradients and shadows
- **Responsive Layout**: Works perfectly on all device sizes
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Interactive Elements**: Star ratings, modals, and dynamic content
- **Accessibility**: Proper contrast, focus states, and semantic HTML

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Server-side validation for all inputs
- **Role-Based Access**: Admin and user role management
- **CORS Configuration**: Proper cross-origin resource sharing

## 🚀 Deployment

### Local Development
1. Ensure MySQL is running
2. Start the server: `node app.js`
3. Open `public/index.html` in your browser

### Production Deployment
1. Set up a production MySQL database
2. Update environment variables for production
3. Use a process manager like PM2: `pm2 start app.js`
4. Set up a reverse proxy (nginx/Apache) if needed
5. Configure SSL certificates for HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Muhammad Sharifuz**
- GitHub: [@sharifuzofc](https://github.com/sharifuzofc)

## 🙏 Acknowledgments

- Font Awesome for icons
- Unsplash for sample book cover images
- The open-source community for various libraries and tools

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/sharifuzofc/Book-Review-Management-System/issues) page
2. Create a new issue with detailed information
3. Contact the author through GitHub

---

**⭐ Star this repository if you find it helpful!** 
=======
# Book-Review-Management-System
>>>>>>> a482fa9ff8d3333fb3fd64a88e7c980252dc018b

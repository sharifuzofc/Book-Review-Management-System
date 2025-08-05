require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware
app.use(cors());
app.use(express.json());

// Database connection with error handling
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "auth_system"
});

// Database connection error handling
db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("MySQL connected successfully");
});

// Database query wrapper with error handling
const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Initialize database tables
app.get("/init", async (req, res) => {
  try {
    // Create users table with proper structure
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    // Create books table
    const createBooksTable = `
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(20) UNIQUE,
        description TEXT,
        cover_image VARCHAR(500),
        published_year INT,
        genre VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    // Create reviews table
    const createReviewsTable = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        book_id INT NOT NULL,
        user_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_book (user_id, book_id)
      )
    `;
    
    // Create comments table
    const createCommentsTable = `
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        user_id INT NOT NULL,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    // Create images table
    const createImagesTable = `
      CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        image_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
      )
    `;
    
    // Execute table creation
    await executeQuery(createUsersTable);
    await executeQuery(createBooksTable);
    await executeQuery(createReviewsTable);
    await executeQuery(createCommentsTable);
    await executeQuery(createImagesTable);
    
    // Create admin user if not exists
    const adminCheck = await executeQuery("SELECT * FROM users WHERE email = 'admin@example.com'");
    if (adminCheck.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await executeQuery(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Admin User", "admin@example.com", hashedPassword, "admin"]
      );
      console.log("Admin user created");
    }
    
    // Add sample books if table is empty
    const booksCheck = await executeQuery("SELECT * FROM books");
    if (booksCheck.length === 0) {
      const sampleBooks = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          isbn: "978-0743273565",
          description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
          published_year: 1925,
          genre: "Classic Fiction",
          cover_image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop"
        },
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "978-0446310789",
          description: "The story of young Scout Finch and her father Atticus in a racially divided Alabama town.",
          published_year: 1960,
          genre: "Classic Fiction",
          cover_image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop"
        },
        {
          title: "1984",
          author: "George Orwell",
          isbn: "978-0451524935",
          description: "A dystopian novel about totalitarianism and surveillance society.",
          published_year: 1949,
          genre: "Science Fiction",
          cover_image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300&h=400&fit=crop"
        }
      ];
      
      for (const book of sampleBooks) {
        await executeQuery(
          "INSERT INTO books (title, author, isbn, description, published_year, genre, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [book.title, book.author, book.isbn, book.description, book.published_year, book.genre, book.cover_image]
        );
      }
      console.log("Sample books added");
    }
    
    res.json({ message: "Database initialized successfully with book review system" });
  } catch (error) {
    console.error("Database initialization error:", error);
    res.status(500).json({ error: "Failed to initialize database" });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    database: db.state === 'authenticated' ? 'connected' : 'disconnected'
  });
});

// JWT Token verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: "Access token required" });
  }
  
  const token = authHeader;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// User Registration (CREATE operation)
app.post("/register", async (req, res) => {
  try {
  const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Check if user already exists
    const existingUser = await executeQuery("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await executeQuery(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: result.insertId, email, name, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: { id: result.insertId, name, email, role: 'user' }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// User Login (READ operation)
app.post("/login", async (req, res) => {
  try {
  const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Find user
    const users = await executeQuery("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Get user profile (READ operation)
app.get("/profile", verifyToken, async (req, res) => {
  try {
    const users = await executeQuery("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve profile" });
  }
});

// Update user profile (UPDATE operation)
app.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }
    
    // Check if email is already taken by another user
    const existingUser = await executeQuery("SELECT * FROM users WHERE email = ? AND id != ?", [email, req.user.id]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already taken" });
    }
    
    await executeQuery(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, req.user.id]
    );
    
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Get dashboard data (READ operation)
app.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const users = await executeQuery("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// Get all books (READ operation)
app.get("/books", async (req, res) => {
  try {
    const books = await executeQuery(
      "SELECT * FROM books ORDER BY created_at DESC"
    );
    
    res.json({ books });
  } catch (error) {
    console.error("Books retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve books" });
  }
});

// Get all users (READ operation - Admin only)
app.get("/users", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    
    const users = await executeQuery(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );
    
    res.json({ users });
  } catch (error) {
    console.error("Users retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
});

// Get reviews count (READ operation - Admin only)
app.get("/reviews/count", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    
    const result = await executeQuery("SELECT COUNT(*) as total_reviews FROM reviews");
    
    res.json({ total_reviews: result[0].total_reviews });
  } catch (error) {
    console.error("Reviews count error:", error);
    res.status(500).json({ error: "Failed to retrieve reviews count" });
  }
});

// Get single book with reviews (READ operation)
app.get("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const books = await executeQuery("SELECT * FROM books WHERE id = ?", [id]);
    if (books.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    const book = books[0];
    
    // Get reviews for this book with images
    const reviews = await executeQuery(`
      SELECT r.*, u.name as user_name, u.email as user_email,
             (SELECT COUNT(*) FROM comments WHERE review_id = r.id) as comment_count
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ?
      ORDER BY r.created_at DESC
    `, [id]);
    
    // Get images for each review
    for (let review of reviews) {
      const images = await executeQuery(
        "SELECT * FROM images WHERE review_id = ? ORDER BY created_at ASC",
        [review.id]
      );
      review.images = images;
    }
    
    // Get average rating
    const avgRating = await executeQuery(`
      SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews
      FROM reviews WHERE book_id = ?
    `, [id]);
    
    res.json({ 
      book, 
      reviews, 
      average_rating: avgRating[0].average_rating || 0,
      total_reviews: avgRating[0].total_reviews || 0
    });
  } catch (error) {
    console.error("Book retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve book" });
  }
});

// Create new book (CREATE operation - Admin only)
app.post("/books", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    
    const { title, author, isbn, description, published_year, genre, cover_image } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ error: "Title and author are required" });
    }
    
    const result = await executeQuery(
      "INSERT INTO books (title, author, isbn, description, published_year, genre, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, author, isbn, description, published_year, genre, cover_image]
    );
    
    res.status(201).json({ 
      message: "Book created successfully",
      bookId: result.insertId 
    });
  } catch (error) {
    console.error("Book creation error:", error);
    res.status(500).json({ error: "Failed to create book" });
  }
});

// Update book (UPDATE operation - Admin only)
app.put("/books/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    
    const { id } = req.params;
    const { title, author, isbn, description, published_year, genre, cover_image } = req.body;
    
    if (!title || !author) {
      return res.status(400).json({ error: "Title and author are required" });
    }
    
    const existingBook = await executeQuery("SELECT * FROM books WHERE id = ?", [id]);
    if (existingBook.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    await executeQuery(
      "UPDATE books SET title = ?, author = ?, isbn = ?, description = ?, published_year = ?, genre = ?, cover_image = ? WHERE id = ?",
      [title, author, isbn, description, published_year, genre, cover_image, id]
    );
    
    res.json({ message: "Book updated successfully" });
  } catch (error) {
    console.error("Book update error:", error);
    res.status(500).json({ error: "Failed to update book" });
  }
});

// Delete book (DELETE operation - Admin only)
app.delete("/books/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin privileges required." });
    }
    
    const { id } = req.params;
    
    const existingBook = await executeQuery("SELECT * FROM books WHERE id = ?", [id]);
    if (existingBook.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    await executeQuery("DELETE FROM books WHERE id = ?", [id]);
    
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Book deletion error:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// Create review (CREATE operation)
app.post("/books/:id/reviews", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review_text } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    
    // Check if book exists
    const book = await executeQuery("SELECT * FROM books WHERE id = ?", [id]);
    if (book.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    // Check if user already reviewed this book
    const existingReview = await executeQuery(
      "SELECT * FROM reviews WHERE book_id = ? AND user_id = ?", 
      [id, req.user.id]
    );
    
    if (existingReview.length > 0) {
      return res.status(400).json({ error: "You have already reviewed this book" });
    }
    
    const result = await executeQuery(
      "INSERT INTO reviews (book_id, user_id, rating, review_text) VALUES (?, ?, ?, ?)",
      [id, req.user.id, rating, review_text]
    );
    
    res.status(201).json({ 
      message: "Review created successfully",
      reviewId: result.insertId 
    });
  } catch (error) {
    console.error("Review creation error:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
});

// Update review (UPDATE operation)
app.put("/reviews/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review_text } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    
    const review = await executeQuery("SELECT * FROM reviews WHERE id = ?", [id]);
    if (review.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Check if user owns this review or is admin
    if (review[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "You can only edit your own reviews" });
    }
    
    await executeQuery(
      "UPDATE reviews SET rating = ?, review_text = ? WHERE id = ?",
      [rating, review_text, id]
    );
    
    res.json({ message: "Review updated successfully" });
  } catch (error) {
    console.error("Review update error:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

// Delete review (DELETE operation)
app.delete("/reviews/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await executeQuery("SELECT * FROM reviews WHERE id = ?", [id]);
    if (review.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Check if user owns this review or is admin
    if (review[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "You can only delete your own reviews" });
    }
    
    await executeQuery("DELETE FROM reviews WHERE id = ?", [id]);
    
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Review deletion error:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// Add comment to review (CREATE operation)
app.post("/reviews/:id/comments", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment_text } = req.body;
    
    if (!comment_text || comment_text.trim().length === 0) {
      return res.status(400).json({ error: "Comment text is required" });
    }
    
    // Check if review exists
    const review = await executeQuery("SELECT * FROM reviews WHERE id = ?", [id]);
    if (review.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    const result = await executeQuery(
      "INSERT INTO comments (review_id, user_id, comment_text) VALUES (?, ?, ?)",
      [id, req.user.id, comment_text]
    );
    
    res.status(201).json({ 
      message: "Comment added successfully",
      commentId: result.insertId 
    });
  } catch (error) {
    console.error("Comment creation error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Get comments for a review (READ operation)
app.get("/reviews/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    
    const comments = await executeQuery(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.review_id = ?
      ORDER BY c.created_at ASC
    `, [id]);
    
    res.json({ comments });
  } catch (error) {
    console.error("Comments retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve comments" });
  }
});

// Delete comment (DELETE operation)
app.delete("/comments/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await executeQuery("SELECT * FROM comments WHERE id = ?", [id]);
    if (comment.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    // Check if user owns this comment or is admin
    if (comment[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "You can only delete your own comments" });
    }
    
    await executeQuery("DELETE FROM comments WHERE id = ?", [id]);
    
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Comment deletion error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// Add image to review (CREATE operation)
app.post("/reviews/:id/images", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, image_name } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: "Image URL is required" });
    }
    
    // Check if review exists
    const review = await executeQuery("SELECT * FROM reviews WHERE id = ?", [id]);
    if (review.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }
    
    // Check if user owns this review or is admin
    if (review[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "You can only add images to your own reviews" });
    }
    
    const result = await executeQuery(
      "INSERT INTO images (review_id, image_url, image_name) VALUES (?, ?, ?)",
      [id, image_url, image_name]
    );
    
    res.status(201).json({ 
      message: "Image added successfully",
      imageId: result.insertId 
    });
  } catch (error) {
    console.error("Image creation error:", error);
    res.status(500).json({ error: "Failed to add image" });
  }
});

// Get images for a review (READ operation)
app.get("/reviews/:id/images", async (req, res) => {
  try {
    const { id } = req.params;
    
    const images = await executeQuery(
      "SELECT * FROM images WHERE review_id = ? ORDER BY created_at ASC",
      [id]
    );
    
    res.json({ images });
  } catch (error) {
    console.error("Images retrieval error:", error);
    res.status(500).json({ error: "Failed to retrieve images" });
  }
});

// Delete image (DELETE operation)
app.delete("/images/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await executeQuery("SELECT * FROM images WHERE id = ?", [id]);
    if (image.length === 0) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    // Get the review to check ownership
    const review = await executeQuery("SELECT * FROM reviews WHERE id = ?", [image[0].review_id]);
    
    // Check if user owns this review or is admin
    if (review[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "You can only delete images from your own reviews" });
    }
    
    await executeQuery("DELETE FROM images WHERE id = ?", [id]);
    
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Image deletion error:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Database init: http://localhost:${port}/init`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.end((err) => {
    if (err) {
      console.error('Error closing database connection:', err);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

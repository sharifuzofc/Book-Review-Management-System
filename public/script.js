// Book Review Management System - Frontend JavaScript
// This file contains all client-side functionality for the book review system

// API Configuration
const API_BASE_URL = "http://localhost:5000";

// Utility Functions (DRY Principle)
const utils = {
  // Show/hide loading states
  showLoading: (buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.querySelector('.btn-text').style.display = 'none';
      button.querySelector('.loading').style.display = 'inline-block';
      button.disabled = true;
    }
  },

  hideLoading: (buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.querySelector('.btn-text').style.display = 'inline';
      button.querySelector('.loading').style.display = 'none';
      button.disabled = false;
    }
  },

  // Display error messages
  showError: (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
      setTimeout(() => {
        errorElement.classList.remove('show');
      }, 5000);
    }
  },

  // Display success messages
  showSuccess: (elementId, message) => {
    const successElement = document.getElementById(elementId);
    if (successElement) {
      successElement.textContent = message;
      successElement.classList.add('show');
      setTimeout(() => {
        successElement.classList.remove('show');
      }, 3000);
    }
  },

  // Clear form inputs
  clearForm: (formId) => {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password strength
  isValidPassword: (password) => {
    return password.length >= 6;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  // Get authentication token
  getAuthToken: () => {
    return localStorage.getItem('token');
  },

  // Make authenticated API requests
  makeAuthenticatedRequest: async (url, options = {}) => {
    const token = utils.getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  // Format date
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Generate star rating HTML
  generateStars: (rating) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<i class="fas fa-star ${i <= rating ? 'active' : ''}"></i>`;
    }
    return stars;
  }
};

// Form Toggle Functionality
function toggleForms(targetForm) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const dashboard = document.getElementById('dashboard');

  // Hide all forms
  loginForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  dashboard.classList.add('hidden');

  // Show target form
  if (targetForm === 'register') {
    registerForm.classList.remove('hidden');
    registerForm.classList.add('fade-in');
  } else if (targetForm === 'login') {
    loginForm.classList.remove('hidden');
    loginForm.classList.add('fade-in');
  } else if (targetForm === 'dashboard') {
    dashboard.classList.remove('hidden');
    dashboard.classList.add('fade-in');
  }

  // Clear any existing error messages
  utils.showError('login-error', '');
  utils.showError('register-error', '');
}

// User Registration Function
async function registerUser(event) {
  event.preventDefault();
  
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    utils.showError('register-error', 'All fields are required');
    return;
  }

  if (!utils.isValidEmail(email)) {
    utils.showError('register-error', 'Please enter a valid email address');
    return;
  }

  if (!utils.isValidPassword(password)) {
    utils.showError('register-error', 'Password must be at least 6 characters long');
    return;
  }

  if (password !== confirmPassword) {
    utils.showError('register-error', 'Passwords do not match');
    return;
  }

  try {
    utils.showLoading('register-btn');

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      utils.showSuccess('register-success', 'Registration successful! Please login.');
      utils.clearForm('registerForm');
      setTimeout(() => {
        toggleForms('login');
      }, 2000);
    } else {
      utils.showError('register-error', data.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    utils.showError('register-error', 'Network error. Please try again.');
  } finally {
    utils.hideLoading('register-btn');
  }
}

// User Login Function
async function loginUser(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  // Validation
  if (!email || !password) {
    utils.showError('login-error', 'Email and password are required');
    return;
  }

  if (!utils.isValidEmail(email)) {
    utils.showError('login-error', 'Please enter a valid email address');
    return;
  }

  try {
    utils.showLoading('login-btn');

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      await loadDashboard();
      toggleForms('dashboard');
    } else {
      utils.showError('login-error', data.error || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    utils.showError('login-error', 'Network error. Please try again.');
  } finally {
    utils.hideLoading('login-btn');
  }
}

// Load Dashboard Data
async function loadDashboard() {
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      document.getElementById('user-name').textContent = userData.name;
      document.getElementById('user-email').textContent = userData.email;
      document.getElementById('user-name-display').textContent = userData.name;
    }

    // Load books
    await loadBooks();
    
    // Check if user is admin and load admin section
    if (userData && userData.role === 'admin') {
      document.getElementById('nav-admin').classList.remove('hidden');
      document.getElementById('btn-add-book').classList.remove('hidden');
      await loadAdminStats();
    }
  } catch (error) {
    console.error('Dashboard loading error:', error);
    logoutUser();
  }
}

// Load Books
async function loadBooks() {
  try {
    const response = await fetch(`${API_BASE_URL}/books`);
    const data = await response.json();
    
    const booksList = document.getElementById('books-list');
    
    if (data.books && data.books.length > 0) {
      booksList.innerHTML = data.books.map(book => `
        <div class="book-card" onclick="showBookDetail(${book.id})">
          <img src="${book.cover_image || 'https://via.placeholder.com/300x400?text=No+Cover'}" 
               alt="${book.title}" class="book-cover" />
          <div class="book-title">${book.title}</div>
          <div class="book-author">by ${book.author}</div>
          <div class="book-rating">
            <span>${book.genre || 'Unknown Genre'}</span>
          </div>
          <div class="book-actions">
            <button onclick="event.stopPropagation(); showBookDetail(${book.id})" class="btn-primary">
              <i class="fas fa-eye"></i> View Details
            </button>
          </div>
        </div>
      `).join('');
    } else {
      booksList.innerHTML = '<p>No books available.</p>';
    }
  } catch (error) {
    console.error('Books loading error:', error);
    utils.showError('books-error', 'Failed to load books');
  }
}

// Show Book Detail
async function showBookDetail(bookId) {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
    const data = await response.json();
    
    if (response.ok) {
      const { book, reviews, average_rating, total_reviews } = data;
      
      // Update navigation
      showSection('book-detail');
      document.getElementById('book-detail-title').textContent = book.title;
      
      // Load book detail content
      const detailContent = document.getElementById('book-detail-content');
      detailContent.innerHTML = `
        <div class="book-detail">
          <div class="book-detail-header">
            <img src="${book.cover_image || 'https://via.placeholder.com/150x200?text=No+Cover'}" 
                 alt="${book.title}" class="book-detail-cover" />
            <div class="book-detail-info">
              <div class="book-detail-title">${book.title}</div>
              <div class="book-detail-author">by ${book.author}</div>
              <div class="book-detail-description">${book.description || 'No description available.'}</div>
              <div class="book-stats">
                <div class="stat">
                  <div class="stat-value">${average_rating.toFixed(1)}</div>
                  <div class="stat-label">Average Rating</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${total_reviews}</div>
                  <div class="stat-label">Total Reviews</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${book.published_year || 'N/A'}</div>
                  <div class="stat-label">Published Year</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="reviews-section">
          <h4><i class="fas fa-star"></i> Reviews (${reviews.length})</h4>
          ${reviews.map(review => `
            <div class="review-card">
              <div class="review-header">
                <div class="review-user">${review.user_name}</div>
                <div class="review-date">${utils.formatDate(review.created_at)}</div>
              </div>
              <div class="review-rating">
                ${utils.generateStars(review.rating)}
                <span>${review.rating}/5</span>
              </div>
              <div class="review-text">${review.review_text || 'No review text.'}</div>
              <div class="review-actions">
                <button onclick="addComment(${review.id})" class="btn-edit">
                  <i class="fas fa-comment"></i> Comment
                </button>
                ${review.user_id === JSON.parse(localStorage.getItem('userData')).id ? `
                  <button onclick="editReview(${review.id})" class="btn-edit">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button onclick="deleteReview(${review.id})" class="btn-delete">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Store current book ID for review form
      window.currentBookId = bookId;
    }
  } catch (error) {
    console.error('Book detail loading error:', error);
    utils.showError('book-detail-error', 'Failed to load book details');
  }
}

// Show Section
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.dashboard-section').forEach(section => {
    section.classList.add('hidden');
  });
  
  // Remove active class from all nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show target section
  const targetSection = document.getElementById(`${sectionName}-section`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
  
  // Add active class to nav button
  const navBtn = document.getElementById(`nav-${sectionName}`);
  if (navBtn) {
    navBtn.classList.add('active');
  }
}

// Show Add Book Form
function showAddBookForm() {
  document.getElementById('add-book-form').classList.remove('hidden');
}

// Hide Add Book Form
function hideAddBookForm() {
  document.getElementById('add-book-form').classList.add('hidden');
  utils.clearForm('bookForm');
}

// Add Book
async function addBook(event) {
  event.preventDefault();
  
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const isbn = document.getElementById('book-isbn').value.trim();
  const description = document.getElementById('book-description').value.trim();
  const published_year = document.getElementById('book-year').value;
  const genre = document.getElementById('book-genre').value.trim();
  const cover_image = document.getElementById('book-cover').value.trim();

  if (!title || !author) {
    utils.showError('book-error', 'Title and author are required');
    return;
  }

  try {
    const data = await utils.makeAuthenticatedRequest('/books', {
      method: 'POST',
      body: JSON.stringify({
        title,
        author,
        isbn,
        description,
        published_year: published_year ? parseInt(published_year) : null,
        genre,
        cover_image
      })
    });

    utils.showSuccess('book-success', 'Book added successfully!');
    hideAddBookForm();
    await loadBooks();
  } catch (error) {
    console.error('Book creation error:', error);
    utils.showError('book-error', error.message || 'Failed to add book');
  }
}

// Submit Review
async function submitReview(event) {
  event.preventDefault();
  
  const rating = parseInt(document.getElementById('review-rating').value);
  const review_text = document.getElementById('review-text').value.trim();
  const image_url = document.getElementById('review-image').value.trim();

  if (!rating || rating < 1 || rating > 5) {
    utils.showError('review-error', 'Please select a rating');
    return;
  }

  if (!window.currentBookId) {
    utils.showError('review-error', 'No book selected');
    return;
  }

  try {
    const data = await utils.makeAuthenticatedRequest(`/books/${window.currentBookId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, review_text })
    });

    // Add image if provided
    if (image_url) {
      await utils.makeAuthenticatedRequest(`/reviews/${data.reviewId}/images`, {
        method: 'POST',
        body: JSON.stringify({ image_url, image_name: 'Review Image' })
      });
    }

    utils.showSuccess('review-success', 'Review submitted successfully!');
    utils.clearForm('reviewForm');
    document.getElementById('review-rating').value = '0';
    document.querySelectorAll('.stars i').forEach(star => star.classList.remove('active'));
    
    // Reload book detail
    await showBookDetail(window.currentBookId);
  } catch (error) {
    console.error('Review submission error:', error);
    utils.showError('review-error', error.message || 'Failed to submit review');
  }
}

// Star Rating Functionality
function initializeStarRating() {
  document.querySelectorAll('.stars i').forEach(star => {
    star.addEventListener('click', function() {
      const rating = parseInt(this.dataset.rating);
      document.getElementById('review-rating').value = rating;
      
      // Update star display
      document.querySelectorAll('.stars i').forEach((s, index) => {
        s.classList.toggle('active', index < rating);
      });
    });
  });
}

// Load Admin Stats
async function loadAdminStats() {
  try {
    const usersResponse = await utils.makeAuthenticatedRequest('/users');
    const booksResponse = await fetch(`${API_BASE_URL}/books`);
    
    const usersData = await usersResponse;
    const booksData = await booksResponse.json();
    
    document.getElementById('total-users').textContent = usersData.users.length;
    document.getElementById('total-books').textContent = booksData.books.length;
    document.getElementById('total-reviews').textContent = '0'; // You can add a reviews endpoint
    
    // Load users list
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = usersData.users.map(user => `
      <div class="user-info">
        <div>
          <strong>${user.name}</strong><br>
          <small>${user.email}</small>
        </div>
        <div class="user-actions">
          <button onclick="editUser(${user.id})" class="btn-edit">Edit</button>
          <button onclick="deleteUser(${user.id})" class="btn-delete">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Admin stats loading error:', error);
  }
}

// Profile Management Functions
function showEditProfile() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData) {
    document.getElementById('edit-name').value = userData.name;
    document.getElementById('edit-email').value = userData.email;
  }
  
  document.getElementById('user-profile').classList.add('hidden');
  document.getElementById('edit-profile-form').classList.remove('hidden');
}

function cancelEditProfile() {
  document.getElementById('user-profile').classList.remove('hidden');
  document.getElementById('edit-profile-form').classList.add('hidden');
  utils.showError('profile-error', '');
  utils.showSuccess('profile-success', '');
}

async function updateProfile(event) {
  event.preventDefault();
  
  const name = document.getElementById('edit-name').value.trim();
  const email = document.getElementById('edit-email').value.trim();

  if (!name || !email) {
    utils.showError('profile-error', 'Name and email are required');
    return;
  }

  if (!utils.isValidEmail(email)) {
    utils.showError('profile-error', 'Please enter a valid email address');
    return;
  }

  try {
    const data = await utils.makeAuthenticatedRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email })
    });

    // Update local storage
    const userData = JSON.parse(localStorage.getItem('userData'));
    userData.name = name;
    userData.email = email;
    localStorage.setItem('userData', JSON.stringify(userData));

    // Update display
    document.getElementById('user-name').textContent = name;
    document.getElementById('user-email').textContent = email;
    document.getElementById('user-name-display').textContent = name;

    utils.showSuccess('profile-success', 'Profile updated successfully!');
    cancelEditProfile();
  } catch (error) {
    console.error('Profile update error:', error);
    utils.showError('profile-error', error.message || 'Failed to update profile');
  }
}

// Logout Function
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  location.reload();
}

// Check Authentication Status on Page Load
function checkAuthStatus() {
  if (utils.isAuthenticated()) {
    loadDashboard().then(() => {
      toggleForms('dashboard');
    }).catch(() => {
      logoutUser();
    });
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Form event listeners
  document.getElementById('loginForm').addEventListener('submit', loginUser);
  document.getElementById('registerForm').addEventListener('submit', registerUser);
  document.getElementById('profileForm').addEventListener('submit', updateProfile);
  document.getElementById('bookForm').addEventListener('submit', addBook);
  document.getElementById('reviewForm').addEventListener('submit', submitReview);

  // Initialize star rating
  initializeStarRating();

  // Check authentication status
  checkAuthStatus();

  // Add fade-in animation to initial form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.classList.add('fade-in');
  }
});

// Export functions for global access
window.toggleForms = toggleForms;
window.showSection = showSection;
window.showAddBookForm = showAddBookForm;
window.hideAddBookForm = hideAddBookForm;
window.showBookDetail = showBookDetail;
window.showEditProfile = showEditProfile;
window.cancelEditProfile = cancelEditProfile;
window.logoutUser = logoutUser;
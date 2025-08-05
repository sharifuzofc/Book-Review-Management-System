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
  },

  // Show notification
  showNotification: (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      ${type === 'success' ? 'background-color: #4CAF50;' : 'background-color: #f44336;'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
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

// User Login Function with enhanced interactivity
async function loginUser(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const loginBtn = document.getElementById('login-btn');

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
    // Enhanced loading state
    utils.showLoading('login-btn');
    loginBtn.style.transform = 'scale(0.95)';
    loginBtn.style.transition = 'all 0.2s ease';

    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Success animation
      loginBtn.style.backgroundColor = '#4CAF50';
      loginBtn.querySelector('.btn-text').textContent = 'Success!';
      
      setTimeout(() => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        loadDashboard().then(() => {
          toggleForms('dashboard');
          utils.showNotification('Welcome back!', 'success');
        });
      }, 500);
    } else {
      // Error animation
      loginBtn.style.backgroundColor = '#f44336';
      loginBtn.querySelector('.btn-text').textContent = 'Failed';
      setTimeout(() => {
        loginBtn.style.backgroundColor = '';
        loginBtn.querySelector('.btn-text').textContent = 'Login';
      }, 1000);
      utils.showError('login-error', data.error || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    utils.showError('login-error', 'Network error. Please try again.');
  } finally {
    utils.hideLoading('login-btn');
    loginBtn.style.transform = '';
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
      const userData = JSON.parse(localStorage.getItem('userData'));
      
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
              ${userData && userData.role === 'admin' ? `
                <div class="book-admin-actions">
                  <button onclick="deleteBook(${book.id})" class="btn-delete">
                    <i class="fas fa-trash"></i> Delete Book
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="reviews-section">
          <h4><i class="fas fa-star"></i> Reviews (${reviews.length})</h4>
          ${reviews.map(review => `
            <div class="review-card" id="review-${review.id}">
              <div class="review-header">
                <div class="review-user">${review.user_name}</div>
                <div class="review-date">${utils.formatDate(review.created_at)}</div>
              </div>
              <div class="review-rating">
                ${utils.generateStars(review.rating)}
                <span>${review.rating}/5</span>
              </div>
              <div class="review-text" id="review-text-${review.id}">${review.review_text || 'No review text.'}</div>
              ${review.images && review.images.length > 0 ? `
                <div class="review-images">
                  ${review.images.map(image => `
                    <img src="${image.image_url}" alt="${image.image_name}" class="review-image" 
                         onclick="openImageModal('${image.image_url}', '${image.image_name}')" />
                  `).join('')}
                </div>
              ` : ''}
              <div class="review-actions">
                <button onclick="addComment(${review.id})" class="btn-edit">
                  <i class="fas fa-comment"></i> Comment
                </button>
                ${userData && review.user_id === userData.id ? `
                  <button onclick="editReview(${review.id}, ${review.rating}, '${review.review_text || ''}')" class="btn-edit">
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

// Edit Review Function
async function editReview(reviewId, currentRating, currentText) {
  const reviewCard = document.getElementById(`review-${reviewId}`);
  const reviewText = document.getElementById(`review-text-${reviewId}`);
  
  // Create edit form
  const editForm = `
    <div class="review-edit-form">
      <div class="rating-group">
        <label>Rating:</label>
        <div class="stars" id="edit-stars-${reviewId}">
          <i class="fas fa-star" data-rating="1" onclick="setEditRating(${reviewId}, 1)"></i>
          <i class="fas fa-star" data-rating="2" onclick="setEditRating(${reviewId}, 2)"></i>
          <i class="fas fa-star" data-rating="3" onclick="setEditRating(${reviewId}, 3)"></i>
          <i class="fas fa-star" data-rating="4" onclick="setEditRating(${reviewId}, 4)"></i>
          <i class="fas fa-star" data-rating="5" onclick="setEditRating(${reviewId}, 5)"></i>
        </div>
        <input type="hidden" id="edit-rating-${reviewId}" value="${currentRating}" />
      </div>
      <div class="input-group">
        <textarea id="edit-review-text-${reviewId}" placeholder="Write your review..." rows="4">${currentText}</textarea>
      </div>
      <div class="edit-actions">
        <button onclick="saveReviewEdit(${reviewId})" class="btn-primary">Save</button>
        <button onclick="cancelReviewEdit(${reviewId})" class="btn-secondary">Cancel</button>
      </div>
    </div>
  `;
  
  reviewText.innerHTML = editForm;
  
  // Set initial rating
  setEditRating(reviewId, currentRating);
}

// Set edit rating
function setEditRating(reviewId, rating) {
  document.getElementById(`edit-rating-${reviewId}`).value = rating;
  const stars = document.querySelectorAll(`#edit-stars-${reviewId} i`);
  stars.forEach((star, index) => {
    star.classList.toggle('active', index < rating);
  });
}

// Save review edit
async function saveReviewEdit(reviewId) {
  const rating = parseInt(document.getElementById(`edit-rating-${reviewId}`).value);
  const reviewText = document.getElementById(`edit-review-text-${reviewId}`).value.trim();
  
  if (!rating || rating < 1 || rating > 5) {
    utils.showNotification('Please select a rating', 'error');
    return;
  }
  
  try {
    await utils.makeAuthenticatedRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, review_text: reviewText })
    });
    
    utils.showNotification('Review updated successfully!', 'success');
    
    // Reload book detail to show updated review
    await showBookDetail(window.currentBookId);
  } catch (error) {
    console.error('Review update error:', error);
    utils.showNotification(error.message || 'Failed to update review', 'error');
  }
}

// Cancel review edit
function cancelReviewEdit(reviewId) {
  // Reload book detail to restore original review
  showBookDetail(window.currentBookId);
}

// Delete Review Function
async function deleteReview(reviewId) {
  if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
    return;
  }
  
  try {
    await utils.makeAuthenticatedRequest(`/reviews/${reviewId}`, {
      method: 'DELETE'
    });
    
    utils.showNotification('Review deleted successfully!', 'success');
    
    // Reload book detail to show updated reviews
    await showBookDetail(window.currentBookId);
  } catch (error) {
    console.error('Review deletion error:', error);
    utils.showNotification(error.message || 'Failed to delete review', 'error');
  }
}

// Delete Book Function (Admin only)
async function deleteBook(bookId) {
  if (!confirm('Are you sure you want to delete this book? This action cannot be undone and will also delete all associated reviews.')) {
    return;
  }
  
  try {
    await utils.makeAuthenticatedRequest(`/books/${bookId}`, {
      method: 'DELETE'
    });
    
    utils.showNotification('Book deleted successfully!', 'success');
    
    // Go back to books list
    showSection('books');
    await loadBooks();
  } catch (error) {
    console.error('Book deletion error:', error);
    utils.showNotification(error.message || 'Failed to delete book', 'error');
  }
}

// Open Image Modal Function
function openImageModal(imageUrl, imageName) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content image-modal">
      <div class="modal-header">
        <h3>${imageName}</h3>
        <button onclick="this.closest('.modal').remove()" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="modal-body">
        <img src="${imageUrl}" alt="${imageName}" class="modal-image" />
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Add Comment Function
async function addComment(reviewId) {
  const commentText = prompt('Enter your comment:');
  if (!commentText || commentText.trim().length === 0) {
    return;
  }
  
  try {
    await utils.makeAuthenticatedRequest(`/reviews/${reviewId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment_text: commentText.trim() })
    });
    
    utils.showNotification('Comment added successfully!', 'success');
    
    // Reload book detail to show new comment
    await showBookDetail(window.currentBookId);
  } catch (error) {
    console.error('Comment creation error:', error);
    utils.showNotification(error.message || 'Failed to add comment', 'error');
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
    utils.showNotification('Title and author are required', 'error');
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

    utils.showNotification('Book added successfully!', 'success');
    hideAddBookForm();
    await loadBooks();
  } catch (error) {
    console.error('Book creation error:', error);
    utils.showNotification(error.message || 'Failed to add book', 'error');
  }
}

// Submit Review
async function submitReview(event) {
  event.preventDefault();
  
  const rating = parseInt(document.getElementById('review-rating').value);
  const review_text = document.getElementById('review-text').value.trim();
  const image_url = document.getElementById('review-image').value.trim();

  if (!rating || rating < 1 || rating > 5) {
    utils.showNotification('Please select a rating', 'error');
    return;
  }

  if (!window.currentBookId) {
    utils.showNotification('No book selected', 'error');
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

    utils.showNotification('Review submitted successfully!', 'success');
    utils.clearForm('reviewForm');
    document.getElementById('review-rating').value = '0';
    document.querySelectorAll('.stars i').forEach(star => star.classList.remove('active'));
    
    // Reload book detail
    await showBookDetail(window.currentBookId);
  } catch (error) {
    console.error('Review submission error:', error);
    utils.showNotification(error.message || 'Failed to submit review', 'error');
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
    const reviewsResponse = await utils.makeAuthenticatedRequest('/reviews/count');
    
    const usersData = await usersResponse;
    const booksData = await booksResponse.json();
    const reviewsData = await reviewsResponse;
    
    document.getElementById('total-users').textContent = usersData.users.length;
    document.getElementById('total-books').textContent = booksData.books.length;
    document.getElementById('total-reviews').textContent = reviewsData.total_reviews;
    
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

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    
    .review-edit-form {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }
    
    .edit-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .btn-primary, .btn-secondary {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #0056b3;
    }
    
    .btn-secondary:hover {
      background-color: #545b62;
    }
  `;
  document.head.appendChild(style);
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
window.editReview = editReview;
window.deleteReview = deleteReview;
window.addComment = addComment;
window.setEditRating = setEditRating;
window.saveReviewEdit = saveReviewEdit;
window.cancelReviewEdit = cancelReviewEdit;
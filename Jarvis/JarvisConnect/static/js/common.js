// Common utility functions

// Quick DOM selector
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Sanitize text content to prevent XSS
const sanitizeText = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Format time for chat messages
const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Resize image on canvas and return base64 data URL
const resizeImageToBase64 = (file, maxWidth = 128, maxHeight = 128, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and resize image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64
            const dataURL = canvas.toDataURL('image/jpeg', quality);
            resolve(dataURL);
        };
        
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
};

// Validate file type and size
const validateImageFile = (file, maxSizeMB = 5) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Please select a valid image file (JPG, PNG, or GIF)' };
    }
    
    if (file.size > maxSizeBytes) {
        return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }
    
    return { valid: true };
};

// Show/hide loading state on button
const setButtonLoading = (button, loading = true) => {
    const textSpan = button.querySelector('.btn-text');
    const spinnerSpan = button.querySelector('.btn-spinner');
    
    if (loading) {
        textSpan?.classList.add('d-none');
        spinnerSpan?.classList.remove('d-none');
        button.disabled = true;
    } else {
        textSpan?.classList.remove('d-none');
        spinnerSpan?.classList.add('d-none');
        button.disabled = false;
    }
};

// Show error message
const showError = (message, alertElement = $('#errorAlert'), messageElement = $('#errorMessage')) => {
    if (messageElement) {
        messageElement.textContent = message;
    }
    if (alertElement) {
        alertElement.classList.remove('d-none');
    }
};

// Hide error message
const hideError = (alertElement = $('#errorAlert')) => {
    if (alertElement) {
        alertElement.classList.add('d-none');
    }
};

// Generate user initials from username
const getUserInitials = (username) => {
    if (!username) return 'U';
    
    const words = username.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    } else {
        return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
    }
};

// Session storage helpers
const SessionStorage = {
    set: (key, value) => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Failed to save to session storage:', e);
            return false;
        }
    },
    
    get: (key) => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Failed to read from session storage:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Failed to remove from session storage:', e);
            return false;
        }
    },
    
    clear: () => {
        try {
            sessionStorage.clear();
            return true;
        } catch (e) {
            console.error('Failed to clear session storage:', e);
            return false;
        }
    }
};

// Auto-scroll to bottom of container
const scrollToBottom = (container) => {
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
};

// Debounce function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
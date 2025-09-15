// Authentication page functionality

class AuthManager {
    constructor() {
        this.form = $('#authForm');
        this.usernameInput = $('#username');
        this.imageInput = $('#imageInput');
        this.dropzone = $('#dropzone');
        this.dropzoneContent = $('#dropzoneContent');
        this.imagePreview = $('#imagePreview');
        this.previewImg = $('#previewImg');
        this.browseBtn = $('#browseBtn');
        this.submitBtn = $('#submitBtn');
        
        this.selectedFile = null;
        this.isProcessing = false;
        
        this.initEventListeners();
        this.checkExistingAuth();
    }
    
    initEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Browse button
        this.browseBtn.addEventListener('click', () => this.imageInput.click());
        
        // File input change
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Dropzone events
        this.dropzone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropzone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropzone.addEventListener('drop', (e) => this.handleDrop(e));
        this.dropzone.addEventListener('click', () => this.imageInput.click());
        
        // Username input validation
        this.usernameInput.addEventListener('input', () => this.validateForm());
        this.usernameInput.addEventListener('blur', () => this.validateUsername());
    }
    
    checkExistingAuth() {
        // Check if user is already authenticated
        const authData = SessionStorage.get('jarvis_auth');
        if (authData && authData.username) {
            // Redirect to chat if already authenticated
            window.location.href = 'chat.html';
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.dropzone.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        // Only remove dragover if we're actually leaving the dropzone
        if (!this.dropzone.contains(e.relatedTarget)) {
            this.dropzone.classList.remove('dragover');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.dropzone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }
    
    async processFile(file) {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            this.showImageError(validation.error);
            return;
        }
        
        try {
            // Show preview
            const previewURL = URL.createObjectURL(file);
            this.previewImg.src = previewURL;
            this.showImagePreview();
            
            // Process and resize image
            const resizedDataURL = await resizeImageToBase64(file, 128, 128, 0.8);
            
            this.selectedFile = {
                name: file.name,
                size: file.size,
                type: file.type,
                dataURL: resizedDataURL
            };
            
            this.hideImageError();
            this.validateForm();
            
        } catch (error) {
            console.error('Error processing image:', error);
            this.showImageError('Failed to process image. Please try another file.');
        }
    }
    
    showImagePreview() {
        this.dropzoneContent.classList.add('d-none');
        this.imagePreview.classList.remove('d-none');
    }
    
    hideImagePreview() {
        this.dropzoneContent.classList.remove('d-none');
        this.imagePreview.classList.add('d-none');
        this.previewImg.src = '';
    }
    
    showImageError(message) {
        const errorDiv = $('#imageError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
    
    hideImageError() {
        const errorDiv = $('#imageError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }
    
    validateUsername() {
        const username = this.usernameInput.value.trim();
        const isValid = username.length >= 2;
        
        if (username && !isValid) {
            this.usernameInput.classList.add('is-invalid');
        } else {
            this.usernameInput.classList.remove('is-invalid');
        }
        
        return isValid;
    }
    
    validateForm() {
        const username = this.usernameInput.value.trim();
        const hasUsername = username.length >= 2;
        const hasImage = this.selectedFile !== null;
        
        const isValid = hasUsername && hasImage;
        this.submitBtn.disabled = !isValid || this.isProcessing;
        
        return isValid;
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isProcessing) return;
        
        // Clear previous errors
        hideError();
        
        // Validate form
        const isUsernameValid = this.validateUsername();
        const isFormValid = this.validateForm();
        
        if (!isUsernameValid) {
            this.usernameInput.classList.add('is-invalid');
            showError('Please enter a valid username (at least 2 characters)');
            return;
        }
        
        if (!this.selectedFile) {
            this.showImageError('Please upload a biometric scan image');
            showError('Please upload a biometric scan image');
            return;
        }
        
        if (!isFormValid) {
            showError('Please complete all required fields');
            return;
        }
        
        await this.performAuthentication();
    }
    
    async performAuthentication() {
        this.isProcessing = true;
        setButtonLoading(this.submitBtn, true);
        
        try {
            const username = this.usernameInput.value.trim();
            
            // Simulate authentication process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create auth data
            const authData = {
                username: username,
                avatar: this.selectedFile.dataURL,
                timestamp: new Date().toISOString(),
                sessionId: 'session_' + Date.now()
            };
            
            // Store in session storage
            const saved = SessionStorage.set('jarvis_auth', authData);
            
            if (!saved) {
                throw new Error('Failed to save authentication data');
            }
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log('Authentication successful for:', username);
            
            // Redirect to chat
            window.location.href = 'chat.html';
            
        } catch (error) {
            console.error('Authentication error:', error);
            showError('Authentication failed. Please try again.');
        } finally {
            this.isProcessing = false;
            setButtonLoading(this.submitBtn, false);
        }
    }
    
    reset() {
        this.form.reset();
        this.selectedFile = null;
        this.hideImagePreview();
        this.hideImageError();
        this.usernameInput.classList.remove('is-invalid');
        hideError();
        this.validateForm();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

// Handle page visibility change to check auth state
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Check if user was authenticated in another tab
        const authData = SessionStorage.get('jarvis_auth');
        if (authData && authData.username) {
            window.location.href = 'chat.html';
        }
    }
});
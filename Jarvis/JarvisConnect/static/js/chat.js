// Chat page functionality

class ChatManager {
    constructor() {
        this.currentUser = $('#currentUser');
        this.userAvatar = $('#userAvatar');
        this.avatarImg = $('#avatarImg');
        this.avatarInitials = $('#avatarInitials');
        this.logoutBtn = $('#logoutBtn');
        this.messageForm = $('#messageForm');
        this.messageInput = $('#messageInput');
        this.sendBtn = $('#sendBtn');
        this.messagesContainer = $('#messagesContainer');
        this.messagesWrapper = $('#messagesWrapper');
        this.typingIndicator = $('#typingIndicator');
        
        this.authData = null;
        this.messages = [];
        this.isTyping = false;
        
        // API endpoint for chat messages
        this.apiEndpoint = '/api/chat';
        
        this.initAuth();
        this.initEventListeners();
        this.loadMessages();
        this.addWelcomeMessage();
    }
    
    initAuth() {
        // Check authentication
        this.authData = SessionStorage.get('jarvis_auth');
        
        if (!this.authData || !this.authData.username) {
            // Redirect to auth page if not authenticated
            window.location.href = 'index.html';
            return;
        }
        
        // Set up user info
        this.currentUser.textContent = this.authData.username;
        
        if (this.authData.avatar) {
            this.avatarImg.src = this.authData.avatar;
            this.avatarImg.style.display = 'block';
            this.avatarInitials.style.display = 'none';
        } else {
            this.avatarInitials.textContent = getUserInitials(this.authData.username);
            this.avatarInitials.style.display = 'flex';
            this.avatarImg.style.display = 'none';
        }
    }
    
    initEventListeners() {
        // Message form submission
        this.messageForm.addEventListener('submit', (e) => this.handleSendMessage(e));
        
        // Logout button
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Message input events
        this.messageInput.addEventListener('input', () => this.handleInputChange());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage(e);
            }
        });
        
        // Auto-focus message input
        this.messageInput.focus();
    }
    
    loadMessages() {
        // Load existing messages from session storage
        const savedMessages = SessionStorage.get('jarvis_messages');
        if (savedMessages && Array.isArray(savedMessages)) {
            this.messages = savedMessages;
            this.renderAllMessages();
        }
    }
    
    saveMessages() {
        SessionStorage.set('jarvis_messages', this.messages);
    }
    
    addWelcomeMessage() {
        // Add welcome message if no messages exist
        if (this.messages.length === 0) {
            const welcomeMessage = {
                id: 'welcome_' + Date.now(),
                content: `Good evening, ${this.authData.username}. I am JARVIS, your artificial intelligence assistant. How may I assist you today?`,
                sender: 'jarvis',
                timestamp: new Date()
            };
            
            this.addMessage(welcomeMessage);
        }
    }
    
    addMessage(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.saveMessages();
        scrollToBottom(this.messagesContainer);
    }
    
    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'd-flex align-items-start mb-3';
        
        const isUser = message.sender === 'user';
        const timestamp = typeof message.timestamp === 'string' 
            ? new Date(message.timestamp) 
            : message.timestamp;
        
        if (isUser) {
            messageDiv.classList.add('justify-content-end');
            messageDiv.innerHTML = `
                <div class="message-bubble user-message">
                    <div class="message-content">${sanitizeText(message.content)}</div>
                    <div class="message-time text-end">${formatTime(timestamp)}</div>
                </div>
                <div class="avatar-small ms-3">
                    ${this.authData.avatar 
                        ? `<img src="${this.authData.avatar}" class="rounded-circle" width="35" height="35" alt="User">`
                        : `<div class="avatar-initials" style="width: 35px; height: 35px; font-size: 0.8rem;">${getUserInitials(this.authData.username)}</div>`
                    }
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="avatar-small jarvis-glow me-3">
                    <i class="bi bi-robot"></i>
                </div>
                <div class="message-bubble jarvis-message">
                    <div class="message-content">${sanitizeText(message.content)}</div>
                    <div class="message-time">${formatTime(timestamp)}</div>
                </div>
            `;
        }
        
        this.messagesWrapper.appendChild(messageDiv);
    }
    
    renderAllMessages() {
        this.messagesWrapper.innerHTML = '';
        this.messages.forEach(message => this.renderMessage(message));
        scrollToBottom(this.messagesContainer);
    }
    
    showTypingIndicator() {
        this.typingIndicator.classList.remove('d-none');
        scrollToBottom(this.messagesContainer);
    }
    
    hideTypingIndicator() {
        this.typingIndicator.classList.add('d-none');
    }
    
    handleInputChange() {
        const message = this.messageInput.value.trim();
        this.sendBtn.disabled = !message || this.isTyping;
    }
    
    async handleSendMessage(e) {
        e.preventDefault();
        
        const messageText = this.messageInput.value.trim();
        if (!messageText || this.isTyping) return;
        
        // Create user message
        const userMessage = {
            id: 'user_' + Date.now(),
            content: messageText,
            sender: 'user',
            timestamp: new Date()
        };
        
        // Add user message
        this.addMessage(userMessage);
        
        // Clear input
        this.messageInput.value = '';
        this.handleInputChange();
        
        // Send to JARVIS API
        await this.sendToJarvis(messageText);
    }
    
    async sendToJarvis(userMessage) {
        this.isTyping = true;
        this.sendBtn.disabled = true;
        this.showTypingIndicator();
        
        try {
            // Prepare the API request
            const requestData = {
                message: userMessage,
                username: this.authData.username,
                timestamp: new Date().toISOString()
            };
            
            // Send POST request to Flask API
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            this.hideTypingIndicator();
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success && data.response) {
                const jarvisMessage = {
                    id: 'jarvis_' + Date.now(),
                    content: data.response,
                    sender: 'jarvis',
                    timestamp: new Date()
                };
                
                this.addMessage(jarvisMessage);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('Error sending message to JARVIS:', error);
            this.hideTypingIndicator();
            
            let errorMessage = 'I apologize, but I encountered a system error. ';
            
            if (error.message.includes('fetch')) {
                errorMessage += 'Unable to connect to my systems. Please check your connection and try again.';
            } else if (error.message.includes('408')) {
                errorMessage += 'My response is taking longer than expected. Please try again.';
            } else if (error.message.includes('503')) {
                errorMessage += 'My external systems are currently unavailable. Please try again in a moment.';
            } else {
                errorMessage += 'Please try again.';
            }
            
            const errorMsg = {
                id: 'jarvis_error_' + Date.now(),
                content: errorMessage,
                sender: 'jarvis',
                timestamp: new Date()
            };
            
            this.addMessage(errorMsg);
        } finally {
            this.isTyping = false;
            this.handleInputChange();
        }
    }
    
    handleLogout() {
        // Confirm logout
        if (confirm('Are you sure you want to logout?')) {
            console.log('User logged out');
            
            // Clear session data
            SessionStorage.clear();
            
            // Redirect to auth page
            window.location.href = 'index.html';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatManager();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Re-check authentication when page becomes visible
        const authData = SessionStorage.get('jarvis_auth');
        if (!authData || !authData.username) {
            window.location.href = 'index.html';
        }
    }
});

// Handle beforeunload to warn about losing chat
window.addEventListener('beforeunload', (e) => {
    // Only warn if there are unsaved messages
    const messages = SessionStorage.get('jarvis_messages');
    if (messages && messages.length > 1) { // More than just welcome message
        e.preventDefault();
        e.returnValue = '';
    }
});
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from groq import Groq
import os
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
GROQ_API_KEY = "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"
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

@app.route('/')
def index():
    """Serve the main authentication page"""
    return send_from_directory('static', 'index.html')

@app.route('/chat.html')
def chat():
    """Serve the chat page"""
    return send_from_directory('static', 'chat.html')

@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory('static/css', filename)

@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files"""
    return send_from_directory('static/js', filename)

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files (CSS, JS, etc.)"""
    return send_from_directory('static', filename)

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    """Handle chat messages and get AI response from Groq"""
    try:
        # Get the message from the request
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
            
        user_message = data['message']
        username = data.get('username', 'User')
        
        logger.info(f"Received message from {username}: {user_message}")
        
        # Call Groq AI to get JARVIS response
        try:
            # Create a system prompt to make the AI behave like JARVIS
            system_prompt = f"""You are JARVIS, Tony Stark's AI assistant from Iron Man. You are sophisticated, intelligent, witty, and helpful. 
            Respond in JARVIS's characteristic style - formal yet personable, with occasional dry humor. 
            Keep responses concise but informative. Address the user as '{username}' when appropriate.
            Always maintain JARVIS's polite and professional demeanor."""
            
            # Send message to Groq
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ],
                model="llama-3.3-70b-versatile",  # Use current Groq model
                temperature=0.7,
                max_tokens=1024
            )
            
            jarvis_response = chat_completion.choices[0].message.content
            
            logger.info(f"Groq response generated for {username}")
            
            return jsonify({
                'success': True,
                'response': jarvis_response
            })
            
        except Exception as e:
            logger.error(f"Groq API call failed: {str(e)}")
            return jsonify({
                'success': False,
                'error': "Unable to connect to JARVIS systems. Please try again."
            }), 503
    
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': "An unexpected error occurred. Please try again."
        }), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'groq_configured': bool(GROQ_API_KEY)
    })

if __name__ == '__main__':
    # Create static directory if it doesn't exist
    os.makedirs('static', exist_ok=True)
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
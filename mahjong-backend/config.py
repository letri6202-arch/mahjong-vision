"""
Configuration module for the Mahjong Vision backend application. 
- This module defines the Config class, which loads configuration settings from environment variables. 
- It uses the python-dotenv library to load environment variables from a .env file, allowing for easy configuration management in different environments (development, testing, production). 
- The Config class includes settings for debugging, Flask environment, secret key, and server host and port.
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = os.getenv('DEBUG', 'False') == 'True'
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    PORT = int(os.getenv('PORT', 5000))
    HOST = os.getenv('HOST', '127.0.0.1')
from flask import Flask
from flask_cors import CORS # type: ignore
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt

# Initalizing Flask 
app = Flask(__name__, template_folder = 'templates', static_folder = 'static')

# Database configuration
app.config['SECRET_KEY'] = 'SCIERA@2024'
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'root'
app.config['MYSQL_DB'] = 'AI_Summarization'

CORS(app)

mysql = MySQL(app)
bcrypt = Bcrypt(app)

from src.routes import API_routes
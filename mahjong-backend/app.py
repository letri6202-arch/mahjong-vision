from flask import Flask
from flask_cors import CORS
from config import Config
from routes import rooms_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

app.register_blueprint(rooms_bp)

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'healthy', 'message': 'Server is running'}, 200

if __name__ == '__main__':
    app.run(
        host=app.config['HOST'],
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )
from flask import Flask, jsonify, request, send_from_directory
import json
import os

app = Flask(__name__)

@app.route('/')
def serve_static():
    return send_from_directory('.', 'login.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

@app.route('/keys', methods=['GET'])
def get_keys():
    try:
        with open('keys.json', 'r') as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/keys', methods=['PUT'])
def update_keys():
    try:
        data = request.get_json()
        with open('keys.json', 'w') as f:
            json.dump(data, f, indent=4)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=3000)
import json
import os

from flask import Flask, Response, request

from effects.loader import EffectLoader
from model import Program, Mode


root = os.path.dirname(__file__) + '/../..'

app = Flask(__name__, static_url_path='', static_folder=root + '/web')
app.add_url_rule('/', 'root', lambda: app.send_static_file('index.html'))


@app.route('/api/program', methods=['POST', 'GET'])
def program_api():
    if request.method == 'POST':
        obj = json.loads(request.data)
        app.access_base.add_program(Program.from_json(obj))
        result = ({'status': '0'})
    elif request.method == 'GET':
        result = [p.to_json() for p in app.access_base.programs()]
    else:
        result = {"status": 1, "message": "Invalid request"}

    return Response(json.dumps(result), mimetype='application/json', headers={'Cache-Control': 'no-cache'})


@app.route('/api/mode', methods=['POST', 'GET'])
def mode_api():
    if request.method == 'POST':
        obj = json.loads(request.data)
        app.access_base.set_mode(Mode.from_json(obj))
        result = ({'status': '0'})
    else:
        result = app.access_base.mode().to_json()

    return Response(json.dumps(result), mimetype='application/json', headers={'Cache-Control': 'no-cache'})


@app.route('/api/effect', methods=['GET'])
def effect_api():
    loader = EffectLoader('repository')
    loader.load_all()

    result = [p.to_json() for p in loader.all_definitions()]
    return Response(json.dumps(result), mimetype='application/json', headers={'Cache-Control': 'no-cache'})


def start(access_base):
    app.access_base = access_base
    app.debug = True
    app.run(port=int(os.environ.get("PORT", 3000)))

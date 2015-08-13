from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html',
                           effects=app.effectenbak.list())

def start(effectenbak):
    app.effectenbak = effectenbak
    app.debug = True
    app.run(host='0.0.0.0')
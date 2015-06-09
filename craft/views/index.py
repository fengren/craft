from flask import Blueprint, render_template

index = Blueprint('index', __name__, static_folder="static", static_url_path="")

@index.route('/')
def index_web():
    return render_template('index.html')
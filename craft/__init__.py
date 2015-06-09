from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy



from .views.index import index
from .views.nodes import nodes

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////Users/zhengwei/Devployment/craft//test.db'

app.register_blueprint(index)
app.register_blueprint(nodes, url_prefix="/nodes")

db = SQLAlchemy(app)

db.create_all()

from flask.ext.sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class DBNode(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    hostname = db.Column(db.String(128))
    ip = db.Column(db.String(128))
    port = db.Column(db.Integer, default=0)

    def __init__(self, hostname, ip, port):
        self.hostname = hostname
        self.ip = ip
        self.port = port

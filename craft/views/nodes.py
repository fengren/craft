import flask

from ..database import DBNode
from ..database import db

nodes = flask.Blueprint("nodes", __name__, static_folder="static", static_url_path="")

@nodes.route("/")
def nodes_web():
    # nodes = []
    nodes = DBNode.query.all()
    for i in DBNode.query.all():
        node = {}
        node['id'] = i.id
        node['hostname'] = i.hostname
        node['ip'] = i.ip
        node['port'] = i.port
        # nodes.append(node)
    return flask.render_template("nodes/index.html", nodes=nodes)


@nodes.route("/add/", methods=["GET", "POST"])
def nodes_add():
    if flask.request.method == "POST":
        data = flask.request.form
        hostname = data.get('node-name')
        ip = data.get("node-ip")
        port = data.get("node-port")

        print data
        node = DBNode(hostname, ip, port)
        db.session.add(node)
        db.session.commit()
        return flask.redirect("/nodes/")

    return flask.render_template("/nodes/_add_node.html")

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_socketio import SocketIO

db = SQLAlchemy()
socketio = SocketIO()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Initialize SQLAlchemy
    db.init_app(app)
    socketio.init_app(app)

    # Register Blueprints
    with app.app_context():
        from . import routes
        db.create_all()
        app.register_blueprint(routes.main)

        # Start MQTT clients
        from .ttn_client import run_mqtt_clients
        run_mqtt_clients(app)

        # Test turn off LED Alarm
        #from .ttn_sensor_alarm import send_downlink
        #send_downlink("OFF")

        # Tests
        #from tests.test_models import test_MsgData_SQLquery, test_SensorInfo_SQLquery
        #test_MsgData_SQLquery("v3/wimosa-albarracin-trh-drgn-app@ttn/devices/eui-a84041e8f18646dc/up")
        #test_SensorInfo_SQLquery("test_sensor_0")

    return app


from . import db

class SensorInfo(db.Model):
    __tablename__ = 'sensor_info'

    sensor_topic = db.Column(db.String(256), primary_key=True)
    sensor_name = db.Column(db.String(50), nullable=False)
    sensor_real_name = db.Column(db.String(100), nullable=False)
    sensor_broker = db.Column(db.String(128), nullable=False)
    sensor_username = db.Column(db.String(128), nullable=False)
    sensor_password = db.Column(db.String(256), nullable=False)

    # Relationship with msg_data
    messages = db.relationship('MsgData', backref='sensor', cascade='all, delete, delete-orphan')

class MsgData(db.Model):
    __tablename__ = 'msg_data'

    id_msg = db.Column(db.Integer, primary_key=True)
    temperature = db.Column(db.Numeric(5, 2), nullable=False)
    humidity = db.Column(db.Numeric(5, 2), nullable=False)
    battery = db.Column(db.Numeric(5, 2), nullable=True)
    msg_time = db.Column(db.DateTime, nullable=False)
    sensor_info_sensor_topic = db.Column(db.String(256), db.ForeignKey('sensor_info.sensor_topic'), nullable=False)

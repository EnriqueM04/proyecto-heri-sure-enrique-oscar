from flask import Blueprint, jsonify, render_template, request
from .models import SensorInfo, MsgData
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
from . import db
from .sockets import notify_new_data
import pytz

from .ttn_sensor_alarm import send_downlink

main = Blueprint('main', __name__)

@main.route('/')
def dashboard():
    # Get all the sensors and associated data and render the template
    sensors = SensorInfo.query.all()
    data = MsgData.query.all()
    #print(data)
    return render_template('dashboard.html', sensors=sensors, data=data)

    
@main.route('/api/sensor-data', methods=['GET'])
def get_sensor_data():
    # Get the all the data of sensor
    sensor_topic = request.args.get('sensor_topic')
    if not sensor_topic:
        return jsonify({"error": "Falta el parámetro 'sensor_topic'"}), 400

    try:
        data = MsgData.query.filter_by(sensor_info_sensor_topic=sensor_topic).order_by(MsgData.msg_time).all()
        result = [{
            "id_msg": msg.id_msg,
            "temperature": float(msg.temperature) if msg.temperature is not None else None,
            "humidity": float(msg.humidity) if msg.humidity is not None else None,
            "battery": float(msg.battery) if msg.battery is not None else None,
            "msg_time": msg.msg_time.isoformat() if msg.msg_time else None
        } for msg in data] #msg.msg_time.strftime("%H:%M")

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@main.route('/api/sensors', methods=['GET'])
def get_sensors():
    # Get the sensors defined in the database
    try:
        sensors = SensorInfo.query.all()
        sensor_list = []
        for sensor in sensors:
            has_battery = MsgData.query.filter(
                MsgData.sensor_info_sensor_topic == sensor.sensor_topic,
                MsgData.battery.isnot(None)
            ).first() is not None
            sensor_list.append({
                "sensor_topic": sensor.sensor_topic,
                "sensor_name": sensor.sensor_name,
                "has_battery": has_battery
            })
        return jsonify(sensor_list), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500

@main.route('/api/add-data', methods=['POST'])
def add_data():
    try:
        data = request.get_json()
        sensor_topic = data['sensor_topic']
        temperature = float(data['temperature'])
        humidity = float(data['humidity'])
        battery = float(data['battery']) if 'battery' in data and data['battery'] else 255

        # Convert current time to local time zone (Madrid)
        local_tz = pytz.timezone("Europe/Madrid")  # Change according to your time zone
        now_utc = datetime.utcnow().replace(tzinfo=pytz.utc)
        local_time = now_utc.astimezone(local_tz).replace(tzinfo=None)

        # Create new entry
        new_entry = MsgData(
            temperature=temperature,
            humidity=humidity,
            battery=battery,
            msg_time=local_time,
            sensor_info_sensor_topic=sensor_topic
        )
        db.session.add(new_entry)
        db.session.commit()

        # Send a notice to the client that there is new data
        notify_new_data(sensor_topic)

        return jsonify({"message": "Data added successfully."}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

# ON/OFF ALARM
@main.route('/send', methods=['POST'])
def send_alarm():
    action = request.form.get('action')
    if action == 'ON':
        send_downlink("ON")
        message = "Message sent: ON"
    elif action == 'OFF':
        send_downlink("OFF")
        message = "Message sent: OFF"
    else:
        message = "Invalid action"
    return render_template('dashboard.html', message=message)


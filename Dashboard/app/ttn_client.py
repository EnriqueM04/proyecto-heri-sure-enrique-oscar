import json
from datetime import datetime, timedelta, timezone
from .sockets import notify_new_data

def on_message(app, client, userdata, msg):
    msg_topic = msg.topic  # Associated SensorInfo object
    payload = json.loads(msg.payload.decode('utf-8'))
    
    # Set the context explicitly with the application
    with app.app_context():
        print("Processing message....")
        process_message(payload, msg_topic)
        print("Notifying data update...")
        notify_new_data(msg_topic)


def process_message(payload, msg_topic):
    from app.models import MsgData  # Deferred import
    from app import db

    print("-"*30)
    
    try:
        # Get the current UTC time
        timestamp = datetime.utcnow()

        # Defines the time difference between Madrid and UTC (in winter +1, in summer +2)
        # Here we assume winter time (+1)
        madrid_offset = timedelta(hours=1)
        madrid_tz = timezone(madrid_offset)
        # Convert UTC time to Madrid time
        timestamp_madrid = timestamp.replace(tzinfo=timezone.utc).astimezone(madrid_tz)
        # Normalize the timestamp to seconds
        timestamp_madrid = timestamp_madrid.replace(microsecond=0)

        # SPECIPHIC DATA ACCORDING TO THE TOPIC
        # Sensor Arbol
        if msg_topic == "": # Topic de tu sensor
            temperature_msg = payload['uplink_message']['decoded_payload']['TempC_SHT31']
            humidity_msg = payload['uplink_message']['decoded_payload']['Hum_SHT31']
            battery_msg = 255
             
        # Sensor Piedra
        elif msg_topic == "": # Topic de tu sensor
            temperature_msg = payload['uplink_message']['decoded_payload']['temperature']
            humidity_msg = payload['uplink_message']['decoded_payload']['humidity']
            battery_msg = payload['uplink_message']['decoded_payload']['battery']

        # Nuestro sensor
        elif msg_topic == "": # Topic de tu sensor
            temperature_msg = payload['uplink_message']['decoded_payload']['temperature_1']
            humidity_msg = payload['uplink_message']['decoded_payload']['relative_humidity_2']
            battery_msg = 255
        

        # Get the sensor msg ID for duplicate control
        last_message = MsgData.query.order_by(MsgData.msg_time.desc()).first()
        new_msg_id = last_message.id_msg +1

        # Save to database
        new_msg = MsgData(
            id_msg= new_msg_id,
            temperature=temperature_msg,
            humidity=humidity_msg,
            battery=battery_msg, # 255 indicates that this device does not contain a battery
            msg_time=timestamp_madrid,
            sensor_info_sensor_topic=msg_topic
        )
        # Calculate the time range of ±1 minute
        time_min = timestamp_madrid - timedelta(minutes=1)
        time_max = timestamp_madrid + timedelta(minutes=1)

        # Query to check duplicates
        existing_msg = MsgData.query.filter(
            MsgData.sensor_info_sensor_topic == msg_topic,
            MsgData.msg_time.between(time_min, time_max),  # Within the range of ±1 minute
            MsgData.temperature == temperature_msg,
            MsgData.humidity == humidity_msg
        ).first()
        
        if (existing_msg == None):
            db.session.add(new_msg)
            db.session.commit()
            print("Saving message...")
            print(f"new_msg: {str(new_msg)}")
            print(f"msg_topic: {str(msg_topic)}")
            print(f"timestamp_madrid: {timestamp_madrid}")
            print(f"temperature_msg {str(temperature_msg)}")
            print(f"humidity: {humidity_msg}")
        print("-"*30)
        
    except Exception as e:
        print(f"Error processing message: {str(e)}")

def start_sensor_client(app, sensor):
    """Starts an MQTT client for a specific sensor in a thread."""
    import paho.mqtt.client as mqtt

    client = mqtt.Client(userdata=sensor)
    client.username_pw_set(username=sensor.sensor_username, password=sensor.sensor_password)
    client.on_message = lambda client, userdata, msg: on_message(app, client, userdata, msg)

    try:
        client.connect(sensor.sensor_broker, port=1883, keepalive=60)
        client.subscribe(sensor.sensor_topic, qos=0)
        client.loop_start()
        print(f"Subscribed to topic: {sensor.sensor_topic}")
    except Exception as e:
        print(f"Error starting client for sensor with topic: {sensor.sensor_topic}: {str(e)}")

def run_mqtt_clients(app):
    """Starts a thread for each sensor."""
    from app.models import SensorInfo  # Deferred import
    from threading import Thread

    with app.app_context():
        sensors = SensorInfo.query.all()  # Get sensors from the database

        for sensor in sensors:
            thread = Thread(target=start_sensor_client, args=(app, sensor), daemon=True)
            thread.start()  



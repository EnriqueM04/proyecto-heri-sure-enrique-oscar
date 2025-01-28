from . import socketio

@socketio.on("connect")
def handle_connect():
    print("Client connected...")
    
# Function to notify customers that there is new data
def notify_new_data(sensor_topic):
    socketio.emit("new_data", {"sensor_topic": sensor_topic})  # Send the topic along with the event

@socketio.on("disconnect") 
def handle_disconnect():
    print("Client disconnected...")
import requests
import base64
import json


def send_downlink(message):
    # Global variables (make sure to replace them with yours)
    APP_ID = ""      # Application ID
    DEVICE_ID = ""   # Device ID
    APP_KEY = ""     # Access Key
    TTN_REGION = ""  # Change the region if necessary (eg. "us1", "eu1")

    # TTN REST API URL (SENSOR ALARM)
    url = f""

    # Encodes the message in Base64 (requirement for downlinks in TTN)
    encoded_message = base64.b64encode(message.encode()).decode()

    # Downlink payload structure
    payload = {
        "downlinks": [
            {
                "f_port": 2,  # LoRaWAN Port
                "frm_payload": encoded_message,  # Base64 encoded message
                "confirmed": False  # Switch to True if you need confirmation from the device
            }
        ]
    }

    # Headers for authentication
    headers = {
        "Authorization": f"Bearer {APP_KEY}",
        "Content-Type": "application/json"
    }

    # Send the message using an HTTP POST request
    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code == 200:
            print("Downlink sent successfully to TTN.")
        else:
            print(f"Error sending downlink: {response.status_code}")
            print(f"Details: {response.text}")
    except Exception as e:
        print(f"Exception when sending message: {e}")


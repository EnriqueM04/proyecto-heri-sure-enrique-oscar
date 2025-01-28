#include "ruiTop.h"
// File to send the sensor data to TTN 
#include "CayenneLPP.h"
#include "radio.hpp"
#include "credentials.h"
#include "alarm.h"

CayenneLPP lpp(51); // Buffer size to hold payload data

void recvCallback(SERVICE_LORA_RECEIVE_T *data)
{
    if (data->BufferSize > 0) {
        Serial.println("Something received!");

        String receivedMessage = "";
        for (int i = 0; i < data->BufferSize; i++) {
            Serial.printf("%c", data->Buffer[i]); // Show the recived message
            receivedMessage += (char)data->Buffer[i];
        }
        Serial.print("\r\n");

        // Turn OFF the LED if we received the "OFF" command
        if (receivedMessage == "OFF") {
            digitalWrite(LED_BUILTIN, LOW); // Turn OFF the LED
            sensor_alarm_status = false;
            Serial.println("LED apagado");
            turn_off_alarm = true;
            Serial.println("Alarma apagada");
        } 
        // Turn ON the alarm if we received the "ON" command
        else if (receivedMessage == "ON") {
            digitalWrite(LED_BUILTIN, HIGH); // Turn ON the LED
            sensor_alarm_status = true;
            Serial.println("LED encendido");
            turn_off_alarm = false;
            Serial.println("Alarma encendida");

        }

        else {
            Serial.println("Mensaje recibido, pero no es un comando reconocido.");
        }
    }
}

void joinCallback(int32_t status)
{
    Serial.printf("Join status: %d\r\n", status);
}

void sendCallback(int32_t status)
{
    if (status == RAK_LORAMAC_STATUS_OK) {
        Serial.println("Successfully sent");
    } else {
        Serial.println("Sending failed");
    }
}

void lorawan_init(void){
    Serial.println("RAKwireless LoRaWan OTAA");
    Serial.println("------------------------------------------------------");

    if(api.lorawan.nwm.get() != 1)
    {
        Serial.printf("Set Node device work mode %s\r\n",
            api.lorawan.nwm.set() ? "Success" : "Fail");
        api.system.reboot();
    }

    // OTAA Device EUI MSB first
    uint8_t node_device_eui[8] = OTAA_DEVEUI;
    // OTAA Application EUI MSB first
    uint8_t node_app_eui[8] = OTAA_APPEUI;
    // OTAA Application Key MSB first
    uint8_t node_app_key[16] = OTAA_APPKEY;

    if (!api.lorawan.appeui.set(node_app_eui, 8)) {
        Serial.printf("LoRaWan OTAA - set application EUI is incorrect! \r\n");
        return;
    }
    if (!api.lorawan.appkey.set(node_app_key, 16)) {
        Serial.printf("LoRaWan OTAA - set application key is incorrect! \r\n");
        return;
    }
    if (!api.lorawan.deui.set(node_device_eui, 8)) {
        Serial.printf("LoRaWan OTAA - set device EUI is incorrect! \r\n");
        return;
    }

    if (!api.lorawan.band.set(OTAA_BAND)) {
        Serial.printf("LoRaWan OTAA - set band is incorrect! \r\n");
        return;
    }
    if (!api.lorawan.deviceClass.set(RAK_LORA_CLASS_A)) {
        Serial.printf("LoRaWan OTAA - set device class is incorrect! \r\n");
        return;
    }
    if (!api.lorawan.njm.set(RAK_LORA_OTAA)) {
        Serial.printf("LoRaWan OTAA - set network join mode is incorrect! \r\n");
        return;
    }
    if (!api.lorawan.join()) {
        Serial.printf("LoRaWan OTAA - join fail! \r\n");
        return;
    }

    /** Wait for Join success */
    while (api.lorawan.njs.get() == 0) {
        Serial.print("Wait for LoRaWAN join...");
        api.lorawan.join();
        delay(10000);
    }

    if (!api.lorawan.adr.set(true)) {
        Serial.printf("LoRaWan OTAA - set adaptive data rate is incorrect! \r\n");
        return;
    }
    if (!api.lorawan.rety.set(1)) {
        Serial.printf("LoRaWan OTAA - set retry times is incorrect! \r\n");
        return;
    }
    if (!api.lorawan.cfm.set(1)) {
        Serial.printf("LoRaWan OTAA - set confirm mode is incorrect! \r\n");
        return;
    }

    /** Check LoRaWan Status*/
    Serial.printf("Duty cycle is %s\r\n", api.lorawan.dcs.get()? "ON" : "OFF");
    Serial.printf("Packet is %s\r\n", api.lorawan.cfm.get()? "CONFIRMED" : "UNCONFIRMED");
    uint8_t assigned_dev_addr[4] = { 0 };
    api.lorawan.daddr.get(assigned_dev_addr, 4);
    Serial.printf("Device Address is %02X%02X%02X%02X\r\n", assigned_dev_addr[0], assigned_dev_addr[1], assigned_dev_addr[2], assigned_dev_addr[3]);
    Serial.printf("Uplink period is %ums\r\n", OTAA_PERIOD);
    Serial.println("");
    api.lorawan.registerRecvCallback(recvCallback);
    api.lorawan.registerJoinCallback(joinCallback);
    api.lorawan.registerSendCallback(sendCallback);
}

void uplink_routine(float temper, float humi)
{
    lpp.reset();

    // Add temperature and humidity to Cayenne LPP payload
    lpp.addTemperature(1, temper); // Channel 1 for temperature
    lpp.addRelativeHumidity(2, humi); // Channel 2 for humidity

    /** Send the data package */
    if (api.lorawan.send(lpp.getSize(), lpp.getBuffer(), 2, false, 1)) {
        Serial.println("Sending is requested");
    } else {
        Serial.println("Sending failed");
    }
}
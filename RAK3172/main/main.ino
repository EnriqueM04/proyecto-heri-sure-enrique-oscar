#include "led.hpp"
#include "temperature_humidity.hpp"
#include "radio.hpp"
#include "credentials.h"

#define PAUSE 100

bool sensor_alarm_status = false;  // Save the status of the alarm
bool turn_off_alarm = false; // True if we turn OFF the alarm manualy

void setup()
{
    Serial.begin(115200, RAK_AT_MODE);
    delay(2000);
    
    // Init de modules
    lorawan_init();
    temperature_humidity_Init();

    // Check that the LED is working
    LED_Init();
    LED_On();
    delay(500);
    LED_Off();
}

//String alarm_status = "OFF"; // Status of the alarm ON/OFF
void loop()
{
    static uint64_t last = 0;
    static uint64_t elapsed;

    float temper;
    float humi;

    temper = temperature_Read();
    Serial.print("Temperature = ");
    Serial.print(temper);
    Serial.println("oC");

    humi = humidity_Read();
    Serial.print("Humidity = ");
    Serial.print(humi);
    Serial.println("%");

    // Turn ON the LED if temperature >= 25.0
    if (temper > 25.0 && turn_off_alarm == false) {
      LED_On();
      Serial.println("Waiting for a message to turn OFF the LED");
      sensor_alarm_status = true;
    }
    // Turn OFF the LED if temperature < 25.5
    if (temper < 24.5) {
      LED_Off();
      sensor_alarm_status = false;
      turn_off_alarm = false;
    }

    // Print alarm control variables
    Serial.print("sensor_alarm_status = ");
    Serial.println(sensor_alarm_status);
    Serial.print("turn_off_alarm = ");
    Serial.println(turn_off_alarm);

    if ((elapsed = millis() - last) > OTAA_PERIOD) {
        uplink_routine(temper, humi);
        last = millis();
    }

    api.system.sleep.all(OTAA_PERIOD);
    Serial.println("------------------------------------------------------");
    delay(120000);
}

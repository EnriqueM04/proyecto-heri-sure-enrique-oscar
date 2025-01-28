/* temperature_humidity.cpp
* A pseudo temperature sensor for the COVID era
* If you have a real sensor, then think on how to update this
*/

#include <Arduino.h>
#include <stdint.h>
#include "temperature_humidity.hpp"
#include "rak1901.h"

rak1901 rak1901;


void temperature_humidity_Init(void)
{
    // begin and set baudrate for Serial
    Serial.begin(115200);//UART0 baudrate 115200

    // begin for I2C
    Wire.begin();

    // check if snesor Rak1901 is work
    Serial.printf("RAK1901 init %s\r\n", rak1901.init() ? "Success" : "Fail");
}

float temperature_Read(void)
{

    static float temp = 0.0;

    if (rak1901.update()) {
        temp = rak1901.temperature();
    } else {
        Serial.println("Please plug in the sensor RAK1901 and Reboot");
    }

    return temp;

}

float humidity_Read(void)
{
    static float hum = 0.0;

    if (rak1901.update()) {
        hum = rak1901.humidity();
    } else {
        Serial.println("Please plug in the sensor RAK1901 and Reboot");
    }

    return hum;

}
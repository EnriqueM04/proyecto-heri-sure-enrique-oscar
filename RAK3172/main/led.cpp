/* led.cpp */

#include <Arduino.h>
#include "led.hpp"

void LED_Init(void)
{
    pinMode(LED_BUILTIN, OUTPUT);
}

void LED_On(void)
{
    digitalWrite(LED_BUILTIN, HIGH);
}

void LED_Off(void)
{
    digitalWrite(LED_BUILTIN, LOW);
}

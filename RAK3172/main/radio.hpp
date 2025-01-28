// Abstractin

#ifndef RADIO_H
#define RADIO_H

void recvCallback(SERVICE_LORA_RECEIVE_T * data);

void joinCallback(int32_t status);

void sendCallback(int32_t status);

void lorawan_init(void);

void uplink_routine(float temper, float humi);

#define OTAA_PERIOD   (20000)

#endif

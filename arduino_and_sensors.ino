#include <SoftwareSerial.h>

#define TRIG_PIN_1 7   
#define ECHO_PIN_1 6   
#define TRIG_PIN_2 9   
#define ECHO_PIN_2 8   

SoftwareSerial BTSerial(10, 11); // RX, TX for Bluetooth Module

void setup() {
    Serial.begin(9600);
    BTSerial.begin(9600); // Bluetooth module baud rate

    pinMode(TRIG_PIN_1, OUTPUT);
    pinMode(ECHO_PIN_1, INPUT);
    pinMode(TRIG_PIN_2, OUTPUT);
    pinMode(ECHO_PIN_2, INPUT);
}

long getDistance(int trigPin, int echoPin) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    long duration = pulseIn(echoPin, HIGH);
    long distance = duration * 0.034 / 2; // Convert to cm
    return distance;
}

void loop() {
    long distance1 = getDistance(TRIG_PIN_1, ECHO_PIN_1);
    long distance2 = getDistance(TRIG_PIN_2, ECHO_PIN_2);

    int sensor1_status = (distance1 < 100) ? 1 : 0; // 1 if object detected, 0 otherwise
    int sensor2_status = (distance2 < 100) ? 1 : 0; // 1 if object detected, 0 otherwise

    // Format output for Serial Monitor and Bluetooth
    String data = "Sensor1: " + String(sensor1_status) + ", Sensor2: " + String(sensor2_status);
    
    Serial.println(data);   // Debugging via Serial Monitor
    BTSerial.println(data); // Send to Bluetooth

    delay(5000);
}

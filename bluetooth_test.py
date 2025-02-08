import serial
import time

BLUETOOTH_PORT = "COM3"  
BAUD_RATE = 9600
QUEUE_FILE = "queue_data.txt"  # File to store queue lengths

def read_bluetooth():
    try:
        # Open Bluetooth Serial Connection
        bt_serial = serial.Serial(BLUETOOTH_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)  # Allow Bluetooth connection to stabilize
        
        print("✅ Connected to Bluetooth. Waiting for data...\n")

        while True:
            # Read data from Bluetooth
            data = bt_serial.readline().decode().strip()
            if data:
                print(f"📡 Received: {data}")

                # Extract Sensor1 and Sensor2 values
                if "Sensor1:" in data and "Sensor2:" in data:
                    parts = data.split(", ")
                    sensor1_status = int(parts[0].split(":")[-1].strip())  # Extract Sensor1 value
                    sensor2_status = int(parts[1].split(":")[-1].strip())  # Extract Sensor2 value

                    print(f"🔍 Sensor 1: {sensor1_status} (1 = Object Detected, 0 = No Object)")
                    print(f"🔍 Sensor 2: {sensor2_status} (1 = Object Detected, 0 = No Object)")

                # Convert sensor data to queue length
                    if sensor1_status == 0:
                        queue_length = 0
                    elif sensor1_status == 1 and sensor2_status == 0:
                        queue_length = 200
                    else:  # sensor1 = 1, sensor2 = 1
                        queue_length = 400

                    print(f"🚦 Updated Queue Length: {queue_length}m")

                    # Save to file
                    with open(QUEUE_FILE, "w") as f:
                        f.write(str(queue_length))

            time.sleep(1)  # Read data every second

    except serial.SerialException:
        print("❌ Could not connect to Bluetooth. Check pairing and COM port.")
    except Exception as e:
        print(f"⚠️ Error: {e}")
    finally:
        if 'bt_serial' in locals():
            bt_serial.close()
            print("🔌 Bluetooth connection closed.")

if __name__ == "__main__":
    read_bluetooth()

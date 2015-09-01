import logging
import serial
import time
from multiprocessing import Array, Process
import struct

def pusher(data):
    last = [0] * 4

    logging.info("Trying to open the serial port ...")

    ser = serial.Serial('COM6', 115200)
    time.sleep(2)

    logging.info("Resetting arduino")

    ser.write(struct.pack('3B', 0, 0, 0))

    logging.info("Starting pusher loop")

    while True:
        if last == data[:]:
            continue
            
        # Writing data
        for i in range(3):
            if last[i] != data[i]:
                ser.write(struct.pack('2B', i+1, data[i]))
                last[i] = data[i]

class ArduinoConnection():
    def __init__(self):
        self._shared_memory = Array('i', [0, 0, 0, 0])

    def write(self, index, value):
        self._shared_memory[index] = value

    def open(self):
        self._process = Process(target=pusher, args=(self._shared_memory,))
        self._process.start()



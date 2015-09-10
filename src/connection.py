import logging
import threading
import serial
import time
from multiprocessing import Array, Process
import struct

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def pusher(data):
    logger.info("Trying to open the serial port ...")

    ser = serial.Serial('/dev/ttyACM0', 115200)
    time.sleep(2)

    logger.info("Resetting arduino")

    ser.write(struct.pack('3B', 0, 0, 0))

    logger.info("Starting pusher loop")

    while True:
        # Writing data
        for i in range(4):
            ser.write(struct.pack('2B', i + 1, data[i]))


class ArduinoConnection():
    def __init__(self):
        self._shared_memory = Array('i', [0, 0, 0, 0])

    def write(self, index, value):
        self._shared_memory[index] = value

    def open(self):
        self._process = Process(target=pusher, args=(self._shared_memory, ))
        self._process.start()


class MockConnection(object):
    def __init__(self):
        pass

    def write(self, index, value):
        pass

    def open(self):
        logger.info("Mock connection opened")

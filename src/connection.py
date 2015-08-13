import logging
import serial
import time
from multiprocessing import Array, Process


def pusher(data):
    last = [0]

    logging.info("Trying to open the serial port ...")

    ser = serial.Serial('COM6', 9600)
    time.sleep(2)

    while True:
        if last == data[:]:
            continue

        # Check wings
        if last[0] != data[0]:
            ser.write(bytearray([1 | (data[0] << 2)]))

        ser.flush()
        last = data[:]


class ArduinoConnection():
    def __init__(self):
        self._shared_memory = Array('i', [0])

    def open(self):
        self._process = Process(target=pusher, args=(self._shared_memory,))
        self._process.start()

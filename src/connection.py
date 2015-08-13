import serial
import time
from multiprocessing import Array, Process


def shared_memory():
    return Array('i',[0])

def pusher(data):
    last = [0]

    print ("Opening serial port")

    ser = serial.Serial('COM6', 9600)
    time.sleep(2)

    print(ser.isOpen())

    while True:
        if last == data[:]:
            continue

        # Check wings
        if last[0] != data[0]:
            ser.write(bytearray([1 | (data[0] << 2)]))

        ser.flush()
        last = data[:]


def start_pushing(data):
    p = Process(target=pusher, args=(data,))
    p.start()

    return p
import os
import threading
from serial import SerialException
from components import Controller
import logging
import connection
from effects import EffectenBak
import http
from model import ReadWriteAccessBase

# if __name__ == '__main__':
#     conn = connection.ArduinoConnection()
#     conn.open()
#
#
#
#     root = os.path.dirname(__file__)
#     config_file = os.path.join(root, '..', 'state', 'config.json')
#     accessbase_path = os.path.join(root, '..', 'state')
#
#
#     bak = EffectenBak(Controller(conn))
#     ab = AccessBase(accessbase_path, bak)
#
#     bak.play_configuration(EffectConfiguration('38388383', 1, ['knipper'], {}))
#

def effectbak_runner(accessbase):

    conn = connection.ArduinoConnection()

    try:
        conn.open()
    except SerialException as e:
        logging.error("Could not open serial port", str(e))

    logging.info("Serial connection opened")
    bak = EffectenBak(Controller(conn), accessbase)
    bak.run()


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    root = os.path.dirname(__file__)
    accessbase_path = os.path.join(root, '..', 'state')

    mainAccessBase = ReadWriteAccessBase(accessbase_path)

    logging.info("Starting effectenbak thread")
    effectenbak = threading.Thread(target=effectbak_runner, args=(mainAccessBase.reader(), ))
    effectenbak.start()

    logging.info("Starting http server")
    http.server.start(mainAccessBase)



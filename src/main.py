#!/usr/bin/env python
import os
import threading
import logging

from serial import SerialException

from components import Controller
import connection
from effects import EffectenBak
from generators import Range
import http
from model import AccessBaseManager, Mode

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def effectbak_runner(accessbase):
    conn = connection.ArduinoConnection()
    #conn = connection.MockConnection()

    try:
        conn.open()
        logging.info("Serial connection opened")
    except SerialException as e:
        logging.error("Could not open serial port", str(e))

    controller = Controller(conn)
    controller.contour.all(False)
    controller.wings.all(False)

    bak = EffectenBak(controller, accessbase)
    bak.run()

if __name__ == '__main__':
    root = os.path.dirname(__file__)
    accessbase_path = os.path.join(root, '..', 'state')

    access_base = AccessBaseManager(accessbase_path)
    server_accessor = access_base.accessor('server')
    effect_accessor = access_base.accessor('effectenbak')

    # Stop
    effect_accessor.set_mode(Mode.stop())

    access_base.change_watcher()

    logging.info("Starting effectenbak thread")
    effectenbak = threading.Thread(target=effectbak_runner, args=(effect_accessor, ), name='effectenbak')
    effectenbak.start()

    logging.info("Starting http server")

    http.server.start(server_accessor)

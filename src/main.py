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
    # conn = connection.MockConnection()

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


def interface_runner(accessbase):

    import RPi.GPIO as GPIO
    import time

    logging.basicConfig(level=logging.DEBUG)
    LOG = logging.getLogger(__name__)
    
    def trigger_next():
        accessbase.play_next()

    def trigger_reset():
        accessbase.set_mode(Mode.stop())

    GPIO.setmode(GPIO.BCM)

    GPIO.setup(17, GPIO.IN, pull_up_down=GPIO.PUD_UP)
    GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    input_next = False
    input_reset = False

    while True:
        # Check next button
        if not GPIO.input(18):
            if not input_next:
                LOG.info("Next button pressed")
                trigger_next()
                input_next = True
        else:
            input_next = False

        if not GPIO.input(17):
            if not input_reset:
                LOG.info("Reset button pressed")
                trigger_reset()
                input_reset = True
        else:
            input_reset = False

        time.sleep(0.2)


if __name__ == '__main__':
    root = os.path.dirname(__file__)
    accessbase_path = os.path.join(root, '..', 'state')

    access_base = AccessBaseManager(accessbase_path)
    server_accessor = access_base.accessor('server')
    effect_accessor = access_base.accessor('effectenbak')
    interface_accessor = access_base.accessor('interface')

    # Stop
    effect_accessor.set_mode(Mode.stop())

    access_base.change_watcher()

    logging.info("Starting effectenbak thread")
    effectenbak = threading.Thread(target=effectbak_runner, args=(effect_accessor,), name='effectenbak')
    effectenbak.start()

    logging.info("Starting interface thread")
    interface = threading.Thread(target=interface_runner, args=(interface_accessor,), name='interface')
    interface.start()

    logging.info("Starting http server")
    http.server.start(server_accessor)

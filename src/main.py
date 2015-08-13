from components import Controller
import logging
import connection
import http
from effects import EffectenBak



if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    conn = connection.ArduinoConnection()
    conn.open()

    bak = EffectenBak(Controller(conn))
    bak.run()

    http.server.start(bak.interface())


from components import Wings, Contour, Fader, Controller
import logging
import connection
import http
from effects import EffectenBak

if __name__ == '__main__':
    print "Starting pusher"
    data = connection.shared_memory()

    process = connection.start_pushing(data)

    bak = EffectenBak(Controller())
    bak.run()


    http.server.start(bak.interface())


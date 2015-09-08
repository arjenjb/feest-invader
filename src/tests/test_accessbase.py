import logging
import os
import threading
import time
from model import AccessBaseManager, Mode

root = os.path.dirname(__file__)
accessbase_path = os.path.join(root, '..', '..', 'state')

manager = AccessBaseManager(accessbase_path, )

def wait_ab(ab, name):
    while True:
        if ab.wait_for_change():
            logging.info(name + " notified")

alpha = manager.accessor()
bravo = manager.accessor()
charlie = manager.accessor()

ta = threading.Thread(target=wait_ab, args=(alpha, 'alpha'))
tb = threading.Thread(target=wait_ab, args=(bravo, 'bravo'))
tc = threading.Thread(target=wait_ab, args=(charlie, 'charlie'))

manager.change_watcher()

ta.start()
tb.start()
tc.start()

time.sleep(1)
logging.info("Changing alpha")
alpha.set_mode(Mode.stop())

time.sleep(1)
logging.info("Changing bravo")
bravo.set_mode(Mode.stop())

time.sleep(2)
logging.info("Changing charli")
charlie.set_mode(Mode.stop())

time.sleep(2)
logging.info("Changing alpha")
alpha.set_mode(Mode.stop())

import logging
import time
from .loader import EffectLoader
import threading

def effect_runner(effect, stop):
    while not stop.is_set():
        effect.tick()

LOG = logging.getLogger('effectenbak')

class EffectenBak:
    def __init__(self, controller, access_base):
        self._access_base = access_base
        self._controller = controller
        self._loader = EffectLoader('repository')
        self._loader.load_all()

        self._stop = None
        self._play_threads = []

    def get_effect_module(self, name):
        return self._loader.get_module(name)

    def play_program(self, program):
        pass

    def play_configuration(self, config):
        modules = [self.get_effect_module(effect_name) for effect_name in config.effects()]

        effects = []
        for effect_class in [module.effect for module in modules if module is not None]:
            params = dict((param.name(), param.value()) for param in config.effect_parameters(effect_class.definition().name()))
            effects.append(effect_class(self._controller, params))

        logging.info("Found {} effects in this configurations".format(str(len(effects))))

        # Spawn player threads
        self._stop = threading.Event()
        self._play_threads = [
            threading.Thread(target=effect_runner, args=(effects[0], self._stop))
        ]

        for thread in self._play_threads:
            thread.start()

    def stop(self):
        if self._stop is None:
            return

        logging.info("Stopping effects ...")
        self._stop.set()
        for t in self._play_threads:
            t.join()
        logging.info("All effects stopped")

        self._play_threads = []
        self._stop = None

    def run(self):
        access_base = self._access_base
        LOG.info("Watching changes in accessbase")
        while True:
            self._access_base.wait_for_change()

            LOG.info("Accessbase changed!")

            self._loader.reload_all()

            mode = access_base.mode()
            if mode.is_stop():
                LOG.info("Stopping")
                self.stop()

            elif mode.is_play_configuration():
                LOG.info("Playing configuration")
                self.stop()
                configuration = mode.get_configuration_in(access_base)
                self.play_configuration(configuration)

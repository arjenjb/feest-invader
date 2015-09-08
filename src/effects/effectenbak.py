import logging
import threading

import planner

from .loader import EffectLoader
from model import Mode

logging = logging.getLogger(__name__)


class ConfigurationPlayer:
    def __init__(self, configuration, effectenbak):
        self._configuration = configuration
        self._effectenbak = effectenbak

        modules = [effectenbak.get_effect_module(effect_name) for effect_name in configuration.effects()]

        effects = []
        for effect_class in [module.effect for module in modules if module is not None]:
            params = dict((param.name(), param.value()) for param in
                          configuration.effect_parameters(effect_class.definition().name()))
            effects.append(effect_class(effectenbak.controller(), params))

        self._effects = effects
        self._planner = planner.for_configuration(configuration)

    def start(self):
        logging.info("Playing configuration %s" % self._configuration.uid())
        logging.info("Found {} effects in this configuration".format(str(len(self._effects))))

        self._planner.execute(self._effects, self._effectenbak.done_signal())

    def play_next(self):
        return False

    def stop(self):
        self._planner.stop()


class RandomPlan:
    pass


class SequencePlan:
    pass


class ProgramPlayer:
    def __init__(self, program, effectenbak):
        self._plan = SequencePlan()
        self._program = program
        self._effectenbak = effectenbak

        self._current = None
        self._players = [ConfigurationPlayer(configuration, effectenbak) for configuration in program.configurations()]

    def start(self):
        self._i = -1
        self.play_next()

    def play_next(self):
        if self._current is not None:
            if self._current.play_next():
                return True

        self._i += 1

        if self._i == len(self._players):
            return False

        logging.info("Playing configuration {}".format(self._i))
        self._current = self._players[self._i]
        self._current.start()

    def stop(self):
        if self._current is not None:
            self._current.stop()


class EffectenBak:
    def __init__(self, controller, access_base):
        self._access_base = access_base
        self._controller = controller
        self._current_mode = access_base.mode()

        self._loader = EffectLoader('repository')
        self._loader.load_all()

        self._player = None
        self._done_event = threading.Event()

    def get_effect_module(self, name):
        return self._loader.get_module(name)

    def controller(self):
        return self._controller

    def done_signal(self):
        return self._done_event

    def play_program(self, program):
        self.stop()

        self._player = ProgramPlayer(program, self)
        self._player.start()

    def play_configuration(self, configuration):
        self.stop()

        if configuration.schedule() is None:
            return

        self._player = ConfigurationPlayer(configuration, self)
        self._player.start()

    def stop(self):
        if self._player is not None:
            logging.info("Stopping ... ")
            self._player.stop()
            logging.info("Stopped")

        self._player = None

    def apply_mode(self, mode):
        self._current_mode = mode

        if mode.is_stop():
            self.stop()

        elif mode.is_play_program():
            logging.info("Playing program")
            self.play_program(mode.get_program_in(self._access_base))

        elif mode.is_play_configuration():
            logging.info("Playing configuration")
            self.play_configuration(mode.get_configuration_in(self._access_base))

    def run(self):
        access_base = self._access_base
        logging.info("Watching changes in accessbase")

        while True:
            if self._done_event.wait(0.100):
                logging.info("Effects done")
                self._done_event.clear()

                if self._player is not None and not self._player.play_next():
                    logging.info("Cleaning up")
                    self._current_mode = Mode.stop()
                    self._access_base.set_mode(self._current_mode)

            if access_base.wait_for_change(0.100):
                if not self.current_mode().equals(access_base.mode()):
                    logging.info("Accessbase has changed!")
                    self.apply_mode(access_base.mode())

    def current_mode(self):
        return self._current_mode

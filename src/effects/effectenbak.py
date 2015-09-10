import logging
from random import shuffle
import threading

import planner
from .loader import EffectLoader
from model import Mode

LOG = logging.getLogger(__name__)

class ConfigurationPlayer:
    def __init__(self, configuration, effectenbak, done_signal):

        self._done_signal = done_signal
        self._configuration = configuration
        self._effectenbak = effectenbak

        def construct_effect(effect):
            effect_class = effectenbak.get_effect_module(effect.name()).effect
            params = dict(((param.name(), param.value()) for param in effect.parameters()))
            return effect_class(effectenbak.controller(), params, effectenbak)

        effects = [construct_effect(effect) for effect in configuration.effects()]

        self._effects = effects
        self._planner = planner.for_configuration(configuration)

    def start(self):
        LOG.info("Playing configuration %s" % self._configuration.uid())
        LOG.info("Found {} effects in this configuration".format(str(len(self._effects))))

        if len(self._effects) == 0:
            LOG.info("Not playing")
            self.done_signal().set()
            return

        self._planner.execute(self._effects, self.done_signal())

    def done_signal(self):
        return self._done_signal

    def play_next(self):
        return False

    def stop(self):
        self._planner.stop()

class ProgramPlayer:
    def __init__(self, program, effectenbak, done_signal, continuous=True):

        self._done_signal = done_signal
        self._program = program
        self._effectenbak = effectenbak
        self._continuous = continuous

        self._current = None
        self._players = []

    def reset(self):
        self._i = -1
        self._current = None
        self._players = [ConfigurationPlayer(configuration, self._effectenbak, self._done_signal) for configuration in
                         self._program.configurations()]

        if self._program.is_random():
            LOG.info("Shuffling configurations")
            shuffle(self._players)

    def start(self):
        self.reset()
        self.play_next()

    def play_next(self):
        if self._current is not None:
            if self._current.play_next():
                return True

        self._i += 1

        if self._i == len(self._players):
            if not self._continuous:
                LOG.info("Reached end of program, done")
                return False

            LOG.info("Reached end of program, restarting")
            self.reset()
            self._i = 0

        LOG.info("Playing configuration {}".format(self._i))
        self._current = self._players[self._i]
        self._current.start()

        return True

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

    def access_base(self):
        return self._access_base

    def get_effect_module(self, name):
        return self._loader.get_module(name)

    def controller(self):
        return self._controller

    def done_signal(self):
        return self._done_event

    def play_program(self, program):
        self.stop()

        self._player = ProgramPlayer(program, self, self._done_event)
        self._player.start()

    def play_configuration(self, configuration):
        self.stop()

        if configuration.schedule() is None:
            return

        self._player = ConfigurationPlayer(configuration, self, self._done_event)
        self._player.start()

    def stop(self):
        if self._player is not None:
            LOG.info("Stopping ... ")
            self._player.stop()
            LOG.info("Stopped")

        self._player = None

    def apply_mode(self, mode):
        self._current_mode = mode

        if mode.is_stop():
            self.stop()

        elif mode.is_play_program():
            LOG.info("Playing program")
            self.play_program(mode.get_program_in(self._access_base))

        elif mode.is_play_configuration():
            LOG.info("Playing configuration")
            self.play_configuration(mode.get_configuration_in(self._access_base))

    def run(self):
        access_base = self._access_base
        LOG.setLevel(logging.DEBUG)
        LOG.info("Watching changes in accessbase")

        while True:
            if self._done_event.wait(0.100):
                LOG.info("Effects done")
                self._done_event.clear()

                if self._player is not None and not self._player.play_next():
                    LOG.info("Cleaning up")
                    self._current_mode = Mode.stop()
                    self._access_base.set_mode(self._current_mode)

            if access_base.wait_for_change(0.100):
                if not self.current_mode().equals(access_base.mode()):
                    LOG.info("Accessbase has changed!")
                    self.apply_mode(access_base.mode())

    def current_mode(self):
        return self._current_mode

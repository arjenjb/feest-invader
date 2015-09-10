import logging
import threading

from effects.effectenbak import ProgramPlayer
from model import EffectDefinition, SubclassResponsibility, ProgramParameter

LOG = logging.getLogger('effect.ProgramEffect')

class BaseEffect(object):
    @classmethod
    def definition(cls):
        return SubclassResponsibility()

    def components(self):
        return self.definition().components()

    def ticks_per_iteration(self):
        return SubclassResponsibility()

    def tick(self):
        return SubclassResponsibility()

    def finalize(self):
        pass


class ProgramEffect(BaseEffect):
    @classmethod
    def definition(cls):
        return EffectDefinition('program', [], [ProgramParameter('program')])

    def __init__(self, controller, parameters, effectenbak):
        self._controller = controller
        self._effectenbak = effectenbak
        self._program = effectenbak.access_base().get_program(parameters.get('program'))

    def ticks_per_iteration(self):
        return 1

    def components(self):
        return self._program.getUsedComponents()

    def tick(self):
        done_signal = threading.Event()
        player = ProgramPlayer(self._program, self._effectenbak, done_signal, continuous=False)

        player.start()
        LOG.info("Waiting for program to finish")
        while True:
            done_signal.wait()
            if player.play_next():
                done_signal.clear()
            else:
                break

        player.stop()
        LOG.info("Program done")


effect = ProgramEffect

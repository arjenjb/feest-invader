import logging
import time

from generators import SineWave
from model import EffectDefinition, BooleanParameter, NumberParameter

LOG = logging.getLogger(__name__)


class BodyWave:
    @classmethod
    def definition(cls):
        return EffectDefinition('body_wave', ['fader'], [
            BooleanParameter('A'),
            BooleanParameter('B'),
            NumberParameter('wave_length', 60000)
        ])

    def __init__(self, controller, parameters, effectenbak):
        self.controller = controller

        self._wave = SineWave(255)

        self._duration_aan = float(parameters.get('wave_length'))
        self._a = parameters.get('A')
        self._b = parameters.get('B')

    def ticks_per_iteration(self):
        return 255

    def tick(self):
        v = self._wave.next()

        if self._a:
            self.controller.fader.a(v)

        if self._b:
            self.controller.fader.b(v)

        sleep = (float(self._duration_aan) / 255) / 1000
        time.sleep(sleep)

    def finalize(self):
        if self._a:
            self.controller.fader.a(0)

        if self._b:
            self.controller.fader.b(0)


effect = BodyWave

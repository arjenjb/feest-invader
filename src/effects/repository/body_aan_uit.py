import logging
import time

from generators import Toggle
from model import EffectDefinition, BooleanParameter, NumberParameter

LOG = logging.getLogger('effect.BodyAanUit')

class BodyAanUit:
    @classmethod
    def definition(cls):
        return EffectDefinition('body_aanuit', ['fader'], [
            BooleanParameter('a'),
            BooleanParameter('b'),
            NumberParameter('duration_uit', 60000),
            NumberParameter('duration_aan', 60000),
        ])

    def __init__(self, controller, parameters, effectenbak):
        self.controller = controller

        self._a = parameters.get('a')
        self._b = parameters.get('b')

        self._toggler = Toggle()
        self._duration_uit = parameters.get('duration_uit')
        self._duration_aan = parameters.get('duration_aan')

    def ticks_per_iteration(self):
        return 2

    def tick(self):
        on = self._toggler.next()
        self.set_state(on)

        if on:
            time.sleep(float(self._duration_aan) / 1000)
        else:
            time.sleep(float(self._duration_uit) / 1000)

    def set_state(self, on):
        if on:
            i = 255
        else:
            i = 0

        if self._a:
            self.controller.fader.a(i)
        if self._b:
            self.controller.fader.b(i)

    def finalize(self):
        self.set_state(False)



effect = BodyAanUit

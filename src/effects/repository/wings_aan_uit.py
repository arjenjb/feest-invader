import logging
import time

from generators import Toggle
from model import EffectDefinition, BooleanParameter, NumberParameter

LOG = logging.getLogger('effect.WingsAanUit')


class WingsAanUit:
    @classmethod
    def definition(cls):
        return EffectDefinition('wings_aan_uit', ['wings'], [
            BooleanParameter('left'),
            BooleanParameter('right'),
            NumberParameter('duration_uit', 60000),
            NumberParameter('duration_aan', 60000),
        ])

    def __init__(self, controller, parameters, effectenbak):
        self.controller = controller

        self._left = parameters.get('left')
        self._right = parameters.get('right')

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
        if self._left:
            self.controller.wings.left(on)
        if self._right:
            self.controller.wings.right(on)

    def finalize(self):
        self.set_state(False)


effect = WingsAanUit

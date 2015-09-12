import logging
import time

from generators import Toggle
from model import EffectDefinition, BooleanParameter, NumberParameter, ChoiceParameter

LOG = logging.getLogger('effect.WingsColor')


class WingsColor:
    @classmethod
    def definition(cls):
        return EffectDefinition('wings_color', ['wings'], [
            ChoiceParameter('color', ['blue', 'orange', 'yellow']),
            NumberParameter('duration_uit', 60000),
            NumberParameter('duration_aan', 60000),
        ])

    def __init__(self, controller, parameters, effectenbak):
        self.controller = controller

        self._color = parameters.get('color', 'blue')

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
        if not on:
            self.controller.wings.all(False)
            return

        if self._color == 'blue':
            self.controller.wings.a(True)

        if self._color == 'orange':
            self.controller.wings.b(True)

        if self._color == 'yellow':
            self.controller.wings.c(True)

    def finalize(self):
        self.set_state(False)

effect = WingsColor

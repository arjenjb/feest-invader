import logging
import time

from generators import Toggle
from model import EffectDescriptor, BooleanParameter, NumberParameter

LOG = logging.getLogger('effect.AanUitEffect')

class AanUitEffect:
    @classmethod
    def definition(cls):
        return EffectDescriptor('aanuit', ['contour'], [
            BooleanParameter('left_eye'),
            BooleanParameter('right_eye'),
            BooleanParameter('body'),
            NumberParameter('duration_uit', 5000),
            NumberParameter('duration_aan', 5000),
        ])

    def __init__(self, controller, parameters):
        self.controller = controller

        bitmask = 0
        if parameters.get('left_eye'):
            bitmask |= self.controller.contour.LEFT
        if parameters.get('right_eye'):
            bitmask |= self.controller.contour.RIGHT
        if parameters.get('body'):
            bitmask |= self.controller.contour.BODY

        self._toggler = Toggle()
        self._bitmask = bitmask
        self._duration_uit = parameters.get('duration_uit')
        self._duration_aan = parameters.get('duration_aan')

    def ticks_per_iteration(self):
        return 2

    def tick(self):
        on = self._toggler.next()
        self.controller.contour.set_tsate(self._bitmask, on)

        if on:
            time.sleep(float(self._duration_aan) / 1000)
        else:
            time.sleep(float(self._duration_uit) / 1000)


effect = AanUitEffect

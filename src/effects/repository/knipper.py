import logging
import time
from generators import SineWave, Toggle
from model import Effect, BooleanParameter

class KnipperEffect():

    @classmethod
    def definition(cls):
        return Effect('knipper', ['contour'], [
            BooleanParameter('left_eye'),
            BooleanParameter('right_eye'),
            BooleanParameter('body')])

    def __init__(self, controller, parameters):
        self.controller = controller

        bitmask = 0
        if parameters.get('left_eye'):
            bitmask |= self.controller.contour.LEFT
        if parameters.get('right_eye'):
            bitmask |= self.controller.contour.RIGHT
        if parameters.get('body'):
            bitmask |= self.controller.contour.BODY

        self._bitmask = bitmask
        self._sine = SineWave(upper=50, lower=1, step=0.2)
        self._toggler = Toggle()

    def tick(self):
        self.controller.contour.set_state(self._bitmask, self._toggler.next())
        time.sleep(0.001 * self._sine.next())

effect = KnipperEffect
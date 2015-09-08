from logging import DEBUG
import time
from effects.effectenbak import logging

from generators import SineWave, Toggle, Range
from model import EffectDescriptor, BooleanParameter


logging.setLevel(DEBUG)

class VliegEffect:
    @classmethod
    def definition(cls):
        return EffectDescriptor('vlieg', ['wings'], [
            BooleanParameter('left'),
            BooleanParameter('right')])

    def __init__(self, controller, parameters):

        self.controller = controller
        self._left = parameters.get('left')
        self._right = parameters.get('right')

        self._generator = Range(3)

    def ticks_per_iteration(self):
        return self._generator.ticks()

    def tick(self):
        i = self._generator.next()
        if self._left:
            self.controller.wings.left(False)
            self.controller.wings.left_index(i, True)

        if self._right:
            self.controller.wings.right(False)
            self.controller.wings.right_index(i, True)

        time.sleep(0.2)

effect = VliegEffect

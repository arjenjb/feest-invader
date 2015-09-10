from logging import DEBUG
import logging
import time

from generators import SineWave, Toggle, Range
from model import EffectDefinition, BooleanParameter, NumberParameter

logging.basicConfig(level=DEBUG)

class VliegFillEffect:
    @classmethod
    def definition(cls):
        return EffectDefinition('vlieg_fill', ['wings'], [
            BooleanParameter('left'),
            BooleanParameter('right'),
            NumberParameter('duration', 10000),
        ])

    def __init__(self, controller, parameters, effectenbak):

        self.controller = controller
        self._left = parameters.get('left')
        self._right = parameters.get('right')
        self._duration = parameters.get('duration')

        self._generator = Range(lower=0, upper=4)

    def ticks_per_iteration(self):
        return self._generator.ticks()

    def tick(self):
        i = self._generator.next()

        if self._left:
            self.controller.wings.left_a(i >= 1)
            self.controller.wings.left_b(i >= 2)
            self.controller.wings.left_c(i >= 3)

        if self._right:
            self.controller.wings.right_a(i >= 1)
            self.controller.wings.right_b(i >= 2)
            self.controller.wings.right_c(i >= 3)

        time.sleep(.2)

    def finalize(self):
        if self._left:
            self.controller.wings.left(False)
        if self._right:
            self.controller.wings.right(False)


effect = VliegFillEffect

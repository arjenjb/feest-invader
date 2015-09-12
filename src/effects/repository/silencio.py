import logging
import threading
import time

from effects.effectenbak import ProgramPlayer
from effects.repository.program import BaseEffect
from model import EffectDefinition, SubclassResponsibility, ProgramParameter, NumberParameter

LOG = logging.getLogger('effect.SilencioEffect')

class SilencioEffect(BaseEffect):
    @classmethod
    def definition(cls):
        return EffectDefinition('silencio', [], [])

    def __init__(self, controller, parameters, effectenbak):
        pass

    def ticks_per_iteration(self):
        return 1

    def components(self):
        return []

    def tick(self):
       time.sleep(1)

effect = SilencioEffect

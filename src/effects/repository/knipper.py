
from generators import SineWave

__author__ = 'Arjen'

class KnipperEffect:

    def __init__(self, controller):
        self.controller = controller
        self.generator = SineWave(255)

    def tick(self):
        self.controller.fader.a(self.generator.next())

effects = [KnipperEffect]
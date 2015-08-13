
class Wings:
    pass

class Contour:
    pass

class Fader:
    def a(self, value):
        pass

    def b(self, value):
        pass

class Controller:
    def __init__(self):
        self.wings = Wings()
        self.contour = Contour()
        self.fader = Fader()

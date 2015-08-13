class Wings:
    def __init__(self, wire):
        pass


class Contour:
    def __init__(self, wire):
        pass


class Fader:
    def __init__(self, wire):
        pass

    def a(self, value):
        pass

    def b(self, value):
        pass


class Controller:
    def __init__(self, wire):
        self.wings = Wings(wire)
        self.contour = Contour(wire)
        self.fader = Fader(wire)

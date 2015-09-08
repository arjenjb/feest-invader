import logging


class Wings:
    ALL = 63

    LEFT_A = 1
    LEFT_B = 2
    LEFT_C = 4
    LEFT = 7

    RIGHT_A = 8
    RIGHT_B = 16
    RIGHT_C = 32

    RIGHT = 56

    TOP = 9
    MIDDLE = 18
    BOTTOM = 36

    def __init__(self, wire):
        self._wire = wire
        self._state = 0

    def all(self, on):
        self.set_state(self.ALL, on)

    def left(self, on):
        self.set_state(self.LEFT, on)

    def right(self, on):
        self.set_state(self.RIGHT, on)

    def right_a(self, on):
        self.set_state(self.RIGHT_A, on)

    def right_b(self, on):
        self.set_state(self.RIGHT_B, on)

    def right_c(self, on):
        self.set_state(self.RIGHT_C, on)

    def right_index(self, i, on):
        self.set_state(8 << i, on)

    def left_a(self, on):
        self.set_state(self.LEFT_A, on)

    def left_b(self, on):
        self.set_state(self.LEFT_B, on)

    def left_c(self, on):
        self.set_state(self.LEFT_C, on)

    def left_index(self, i, on):
        self.set_state(1 << i, on)

    def set_state(self, param, on):
        if on:
            self._state |= param
        else:
            self._state &= (~param & 0xFF)

        self._wire.write(3, self._state)


class Contour:
    BODY = 1
    LEFT = 2
    RIGHT = 4

    def __init__(self, wire):
        self._wire = wire
        self._state = 0

    def body(self, on):
        self.set_state(self.BODY, on)

    def left_eye(self, on):
        self.set_state(self.LEFT, on)

    def right_eye(self, on):
        self.set_state(self.RIGHT, on)

    def eyes(self, on):
        self.set_state(self.LEFT | self.RIGHT, on)

    def all(self, on):
        self.set_state(self.LEFT | self.RIGHT | self.BODY, on)

    def set_state(self, param, on):
        if on:
            self._state |= param
        else:
            self._state &= (~param & 0xFF)

        self._wire.write(2, self._state)

class Fader:
    def __init__(self, wire):
        self._wire = wire

    def a(self, value):
        self._wire.write(0, int(value))

    def b(self, value):
        self._wire.write(1, int(value))


class Controller:
    def __init__(self, wire):
        self.wings = Wings(wire)
        self.contour = Contour(wire)
        self.fader = Fader(wire)

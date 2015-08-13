import math


class SineWave:
    def __init__(self, upper, lower=0, step=1):
        self._upper = upper
        self._lower = lower
        self._range = self._upper - self._lower
        self._step = math.pi * 2 / (self._range / step)
        self._value = 0
        self._iteration = 0

    def next(self):
        self._value += self._step
        if self._iteration == self._range:
            self._iteration = 0
            self._value = 0

        return round((math.sin(self._value) / 2 + 0.5) * self._range + self._lower * self._step)
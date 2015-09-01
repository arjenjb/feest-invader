import math


class Toggle:
    def __init__(self):
        self._state = False

    def next(self):
        self._state = not self._state
        return self._state


class SineWave:
    def __init__(self, upper, lower=0, step=1):

        if lower > upper:
            raise Exception("The lower bound cannot be higher than the upper bound")

        self._upper = upper
        self._lower = lower

        self._range = (self._upper - self._lower)
        self._max_iterations = int(self._range / step)
        self._step = math.pi * 2 / self._max_iterations

        self._value = 0.0
        self._iteration = 0

    def next(self):
        self._value += self._step
        self._iteration += 1

        if self._iteration == self._max_iterations:
            self._iteration = 0
            self._value = 0

        return round(
            (math.sin(self._value) / 2.0 + 0.5) * (self._range) + self._lower)
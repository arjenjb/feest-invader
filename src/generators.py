import math


class Range:
    def __init__(self, upper, lower=0):
        self._upper = upper
        self._lower = lower
        self._i = lower - 1

    def next(self):
        self._i += 1

        # Reached upper limit?
        if self._i == self._upper:
            self._i = self._lower

        return self._i

    def ticks(self):
        return self._upper - self._lower


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
        self._max = int(self._range / step)
        self._step = math.pi * 2 / self._max

        self._value = 0.0
        self._i = 0

    def ticks_per_wave(self):
        return self._max

    def next(self):
        self._value += self._step
        self._i += 1

        if self._i == self._max:
            self._i = 0
            self._value = 0

        return round(
            (math.sin(self._value) / 2.0 + 0.5) * (self._range) + self._lower)

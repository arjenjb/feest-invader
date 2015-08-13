from .loader import EffectLoader

class EffectenBak:
    def __init__(self, contoller):
        self._controller = contoller
        self._loader = EffectLoader('effects')
        self._loader.load_all()

    def list(self):
        return self._loader.all()
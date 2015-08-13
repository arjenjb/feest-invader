from .loader import EffectLoader

class Program:
    def __init__(self):
        # effects: [
        #   ProgrammedEffect: (effect_name, duration=-1, repeat=-1)
        # ]
        # mode: Sequential, Randomize
        pass



class Interface:

    def list_programs(self):
        pass

    def save_program(self, program):
        pass

    def delete_program(self, program):
        pass

    def play_program(self, name):
        pass



class EffectenBak:

    def __init__(self, contoller):
        self._controller = contoller
        self._loader = EffectLoader('repository')
        self._loader.load_all()

        

    def interface(self):
        return Interface(self._interface_event)
    def run(self):
        pass
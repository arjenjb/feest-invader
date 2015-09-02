import os
import jsonpickle

CONFIG_FILE = None

class Configuration():
    def __init__(self, filename):
        self._filename = filename
        self._storage = self.load()
        self._iterations = None

    def programs(self):
        return self._storage.programs()

    def add_program(self, program):
        self.programs().append(program)

    def get_program(self, name):
        for p in self.programs():
            if p.name() == name:
                return p
        return None

    def save(self):
        with open(self._filename, 'w') as fp:
            fp.write(jsonpickle.encode(self._storage))

    def load(self):
        if os.path.exists(self._filename):
            with open(self._filename, 'r') as fp:
                return jsonpickle.decode(fp.read())
        else:
            return Storage()


class Program:
    def __init__(self, name):
        self._name = name

    def name(self):
        return self._name

class Storage:
    def __init__(self):
        self._programs = []

    def programs(self):
        return self._programs


def init(file):
    global CONFIG_FILE
    CONFIG_FILE = file


def new():
    return Configuration(filename=CONFIG_FILE)


def read_write():
    return new()


def read():
    return new()
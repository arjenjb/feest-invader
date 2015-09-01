import json
from multiprocessing import Value
import os
import threading

import threads


class SubclassResponsibility(Exception):
    pass


class AbstractAccessBase:
    def __init__(self, path):
        self._path = path

    def read_lock(self):
        """
        to be implemented
        """
        raise SubclassResponsibility()

    def programs(self):
        programs = []
        path = self._path + '/program'

        with self.read_lock():
            for filename in [f for f in os.listdir(path) if f.endswith('.json')]:
                with open(os.path.join(path, filename), 'r') as fp:
                    programs.append(Program.from_json(json.load(fp)))

        return programs

    def get_program(self, uid):
        filename = self._path + '/program/{}.json'.format(uid)

        with self.read_lock():
            with open(filename, 'r') as fp:
                return Program.from_json(json.load(fp))

    def mode(self):
        filename = self._path + '/mode.json'

        if not os.path.exists(filename):
            return Mode.stop()

        with self.read_lock():
            with open(filename, 'r') as fp:
                return Mode.from_json(json.load(fp))


class ReadAccessBase(AbstractAccessBase):
    def __init__(self, path, event, lock, version):
        AbstractAccessBase.__init__(self, path)
        self._event = event
        self._version = version
        self._lock = lock
        self._my_version = version.value

    def read_lock(self):
        return self._lock.rdlocked()

    def get_version(self):
        return self._version

    def wait_for_change(self, timeout=None):
        if self.versions_differ():
            self._my_version = self._version.value
            return True

        result = self._event.wait(timeout)
        self._my_version = self._version.value
        self._event.clear()

        return result

    def versions_differ(self):
        return self._my_version != self._version.value


class ReadWriteAccessBase(AbstractAccessBase):
    def __init__(self, path):
        AbstractAccessBase.__init__(self, path)
        self._events = []
        self._version = Value('i', 0)
        self._lock = threads.RWLock()

    def write_lock(self):
        return self._lock.wrlocked()

    def read_lock(self):
        return self._lock.rdlocked()

    def add_program(self, program):
        with self.write_lock():
            with open('{}/program/{}.json'.format(self._path, program.uid()), 'w') as fp:
                json.dump(program.to_json(), fp)

        self.notify_changed()

    def remove_program(self, uid):
        with self.write_lock():
            os.remove('{}/program/{}.json'.format(self._path, uid()))
        self.notify_changed()

    def notify_changed(self):
        version = self._version
        with version.get_lock():
            version.value += 1

        for e in self._events:
            e.set()

    def reader(self):
        event = threading.Event()
        self._events.append(event)
        return ReadAccessBase(self._path, event, self._lock, self._version)

    def set_mode(self, mode):
        filename = self._path + '/mode.json'
        with self.write_lock():
            with open(filename, 'w') as fp:
                json.dump(mode.to_json(), fp)

        self.notify_changed()


class Effect:
    def __init__(self, name, components, parameters):
        self._name = name
        self._components = components
        self._parameters = parameters

    def to_json(self):
        return {
            'name': self.name(),
            'parameters': map(ParameterDefinition.to_json, self.parameters()),
            'components': self.components()}

    def name(self):
        return self._name

    def parameters(self):
        return self._parameters

    def components(self):
        return self._components


class ParameterDefinition(object):
    def __init__(self, name, type, options):
        self._name = name
        self._type = type
        self._options = options

    def to_json(self):
        return {
            'name': self._name,
            'type': self._type,
            'options': self._options,
        }


class BooleanParameter(ParameterDefinition):
    def __init__(self, name):
        ParameterDefinition.__init__(self, name, 'boolean', {})


class ChoiceParameter(ParameterDefinition):
    def __init__(self, name, choices):
        ParameterDefinition.__init__(self, name, 'choice', {'choices': choices})


class NumberParameter(ParameterDefinition):
    def __init__(self, name, max, min=0):
        ParameterDefinition.__init__(self, name, 'number', {'min': min, 'max': max, })


class EffectConfiguration:
    def __init__(self, uid, index, effects, parameters):
        self._uid = uid
        self._index = index
        self._effects = effects
        self._parameters = parameters

    def uid(self):
        return self._uid

    @classmethod
    def from_json(cls, object):
        return EffectConfiguration(
            object['uid'],
            object['index'],
            object['effects'],
            object['parameters']
        )

    def to_json(self):
        return {
            'uid': self._uid,
            'index': self._index,
            'effects': self._effects,
            'parameters': self._parameters
        }

    def effects(self):
        return self._effects

    def effect_parameters(self, effect_name):
        return [p for p in self._parameters if p.effect() == effect_name]

class Program:
    def __init__(self, uid, name, configurations):
        self._configurations = configurations
        self._name = name
        self._uid = uid

    def uid(self):
        return self._uid

    def get_configuration(self, uid):
        return next((c for c in self._configurations if c.uid() == uid), None)

    @classmethod
    def from_json(cls, object):
        return Program(
            object['uid'],
            object['name'],
            map(EffectConfiguration.from_json, object['configurations'])
        )

    def to_json(self):
        return {
            'uid': self._uid,
            'name': self._name,
            'configurations': map(EffectConfiguration.to_json, self._configurations),
        }

class Mode(object):
    def __init__(self, state, program_uid=None, configuration_uid=None):
        self._state = state
        self._program_uid = program_uid
        self._configuration_uid = configuration_uid

    def is_stop(self):
        return self._state == 'stop'

    def is_play_configuration(self):
        return self._state == 'play:configuration'

    def is_play_program(self):
        return self._state == 'play:program'

    def get_configuration_in(self, access_base):
        return self\
            .get_program_in(access_base)\
            .get_configuration(self._configuration_uid)

    def get_program_in(self, access_base):
        return access_base.get_program(self._program_uid)

    @classmethod
    def from_json(cls, obj):
        return Mode(obj['state'], obj.get('program_uid'), obj.get('configuration_uid'))

    def to_json(self):
        return {
            'state': self._state,
            'program_uid': self._program_uid,
            'configuration_uid': self._configuration_uid
        }

    @classmethod
    def stop(cls):
        return Mode('stop')

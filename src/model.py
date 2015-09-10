import json
import logging
from multiprocessing import Value
import os
import threading

import threads

logging.basicConfig(level=logging.DEBUG)

logger = logging.getLogger(__name__)


class SubclassResponsibility(Exception):
    pass


class AccessBase(object):
    def __init__(self, id, path, changed_event, notify_event, lock, version):
        self._id = id
        self._path = path
        self._changed_event = changed_event
        self._notify_event = notify_event
        self._version = version
        self._lock = lock
        self._my_version = version.value

        # Data
        self._mode = None

    def get_version(self):
        return self._version

    def wait_for_change(self, timeout=None):
        if self.versions_differ():
            self.version_changed()
            return True

        result = self._notify_event.wait(timeout)

        if result:
            self._notify_event.clear()

        if self.versions_differ():
            self.version_changed()
            return True

        return False

    def versions_differ(self):
        return self._my_version != self._version.value

    #
    # Locking
    #

    def write_lock(self):
        return self._lock.wrlocked()

    def read_lock(self):
        return self._lock.rdlocked()

    def notify_changed(self):
        version = self._version
        with version.get_lock():
            version.value += 1
            self._my_version = version.value

        self._changed_event.set()

    #
    # Accessing
    #
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

    def add_program(self, program):
        with self.write_lock():
            with open('{}/program/{}.json'.format(self._path, program.uid()), 'w') as fp:
                json.dump(program.to_json(), fp)

        self.notify_changed()

    def remove_program(self, uid):
        with self.write_lock():
            os.remove('{}/program/{}.json'.format(self._path, uid))
        self.notify_changed()

    def mode(self):
        self.check_version()
        if self._mode is None:
            self._mode = self._load_mode()

        return self._mode

    def _load_mode(self):
        logger.info("Loading mode for {}".format(self._id))

        filename = self._path + '/mode.json'
        if not os.path.exists(filename):
            return Mode.stop()
        with self.read_lock():
            with open(filename, 'r') as fp:
                return Mode.from_json(json.load(fp))

    def set_mode(self, mode):
        self.check_version()

        if mode.equals(self.mode()):
            logger.info("Mode's the same, nothing to be done")
            return

        self._mode = mode

        filename = self._path + '/mode.json'
        with self.write_lock():
            with open(filename, 'w') as fp:
                json.dump(mode.to_json(), fp)

        self.notify_changed()

    def play_next(self):
        programs = filter(lambda p: p.target() != -1, self.programs())
        if len(programs) == 0:
            return

        if self.mode().is_stop():
            self.set_mode(Mode.play_program(programs[0]))
            return

        playing = self.mode().program_uid()
        l = len(programs)

        for i in range(0, l):
            if programs[i].uid() == playing:
                self.set_mode(programs[(i + 1) % l])
                return

        self.set_mode(Mode.play_program(programs[0]))

    def version_changed(self):
        self._my_version = self._version.value
        self._mode = None

    def check_version(self):
        if self.versions_differ():
            self.version_changed()


class AccessBaseManager(object):
    def __init__(self, path):
        self._path = path
        self._changed_event = threading.Event()
        self._notify_events = []

        self._version = Value('i', 0)
        self._lock = threads.RWLock()

    def accessor(self, id):
        notify_event = threading.Event()
        self._notify_events.append(notify_event)

        return AccessBase(id, self._path, self._changed_event, notify_event, self._lock, self._version)

    def change_watcher(self):

        def notify(changed, notifiers):
            logging.info("Waiting for accessbase changes")

            while True:
                changed.wait()

                logging.info("Notifying accessbases")
                for e in notifiers:
                    e.set()

                changed.clear()

        notify_thread = threading.Thread(target=notify, args=(self._changed_event, self._notify_events),
                                         name='accessbase_notifier')
        notify_thread.start()


class EffectDefinition(object):
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


class Effect(object):
    def __init__(self, uid, name, index, parameters):
        self._uid = uid
        self._index = index
        self._name = name
        self._parameters = parameters

    @classmethod
    def from_json(cls, object):
        return Effect(
            object['uid'],
            object['name'],
            object['index'],
            map(ParameterValue.from_json, object['parameters']))

    def to_json(self):
        return {
            'uid': self.uid(),
            'name': self.name(),
            'index': self.index(),
            'parameters': map(ParameterValue.to_json, self.parameters())
        }

    def uid(self):
        return self._uid

    def parameters(self):
        return self._parameters

    def name(self):
        return self._name

    def index(self):
        return self._index


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


class ProgramParameter(ParameterDefinition):
    def __init__(self, name):
        ParameterDefinition.__init__(self, name, 'program', {})

class NumberParameter(ParameterDefinition):
    def __init__(self, name, max, min=0):
        ParameterDefinition.__init__(self, name, 'number', {'min': min, 'max': max, })


class Schedule(object):
    @classmethod
    def from_json(cls, obj):
        if obj is None:
            return ScheduleNone()

        if obj['type'] == 'iterations':
            return ScheduleIterations(obj['iterations'])

        if obj['type'] == 'duration':
            return ScheduleDuration(obj['duration'])


class AbstractSchedule(object):
    pass

    def accept(self, visitor):
        method = 'visit' + self.__class__.__name__
        return getattr(visitor, method)(self)


class ScheduleNone(object):
    def to_json(self):
        return None

    def type(self):
        return 'none'


class ScheduleIterations(AbstractSchedule):
    def __init__(self, iterations):
        self._iterations = iterations

    def to_json(self):
        return {
            'type': self.type(),
            'iterations': self._iterations
        }

    def iterations(self):
        return int(self._iterations)

    def type(self):
        return 'iterations'


class ScheduleDuration(AbstractSchedule):
    def __init__(self, duration):
        self._duration = duration

    def to_json(self):
        return {
            'type': self.type(),
            'duration': self._duration
        }

    def type(self):
        return 'duration'

    def duration(self):
        return int(self._duration)

class ParameterValue(object):
    def __init__(self, name, value):
        self._name = name
        self._value = value

    def name(self):
        return self._name

    def value(self):
        return self._value

    @classmethod
    def from_json(cls, obj):
        return ParameterValue(obj['name'], obj['value'])

    def to_json(self):
        return {
            'name': self._name,
            'value': self._value,
        }


class EffectConfiguration(object):
    def __init__(self, uid, index, effects, schedule):
        self._uid = uid
        self._index = index
        self._effects = effects
        self._schedule = schedule

    def uid(self):
        return self._uid

    @classmethod
    def from_json(cls, object):
        return EffectConfiguration(
            object['uid'],
            object['index'],
            map(Effect.from_json, object['effects']),
            Schedule.from_json(object['schedule']))

    def to_json(self):
        return {
            'uid': self._uid,
            'index': self._index,
            'effects': map(Effect.to_json, self._effects),
            'schedule': self._schedule.to_json()
        }

    def effects(self):
        return self._effects

    def schedule(self):
        return self._schedule


class Program(object):
    def __init__(self, uid, name, configurations, schedule, target):
        self._configurations = configurations
        self._name = name
        self._uid = uid
        self._schedule = schedule
        self._target = target

    def uid(self):
        return self._uid

    def configurations(self):
        return self._configurations

    def target(self):
        return self._target

    def schedule(self):
        return self._schedule

    def is_random(self):
        return self._schedule == 'random'

    def get_configuration(self, uid):
        return next((c for c in self._configurations if c.uid() == uid), None)

    @classmethod
    def from_json(cls, object):
        return Program(
            object.get('uid'),
            object.get('name'),
            map(EffectConfiguration.from_json, object.get('configurations', [])),
            object.get('schedule', 'sequence'),
            object.get('target', None)
        )

    def to_json(self):
        return {
            'uid': self._uid,
            'name': self._name,
            'configurations': map(EffectConfiguration.to_json, self._configurations),
            'schedule': self._schedule,
            'target': self._target
        }


class Mode(object):

    @classmethod
    def play_program(cls, program):
        return Mode('play:program', program.uid())

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
        return self \
            .get_program_in(access_base) \
            .get_configuration(self._configuration_uid)

    def get_program_in(self, access_base):
        return access_base.get_program(self._program_uid)

    def program_uid(self):
        return self._program_uid

    def equals(self, other):
        return other is not None \
               and self._state == other._state \
               and self._program_uid == other._program_uid \
               and self._configuration_uid == other._configuration_uid

    def __str__(self):
        if self.is_stop():
            return "Mode(Stopped)"

        if self.is_play_configuration():
            return "Mode(Configuration,{})".format(self._configuration_uid)

        if self.is_play_program():
            return "Mode(Program,{})".format(self._program_uid)

        return "Mode(Unknown)"

    def to_json(self):
        return {
            'state': self._state,
            'program_uid': self._program_uid,
            'configuration_uid': self._configuration_uid
        }

    @classmethod
    def from_json(cls, obj):
        return Mode(obj['state'], obj.get('program_uid'), obj.get('configuration_uid'))

    @classmethod
    def stop(cls):
        return Mode('stop')

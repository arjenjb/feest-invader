import logging
import threading

from model import SubclassResponsibility
from threads import CountingEvent

__author__ = 'Arjen'

LOG = logging.getLogger(__name__)


def effect_runner_continuous(effect, schedule, stop, done):
    while not stop.is_set():
        effect.tick()

    effect.finalize()
    done.signal()

    logging.info("Continuous runner done")


def effect_runner_iterations(effect, schedule, stop, done):
    logging.info("Starting iterations runner")

    n = effect.ticks_per_iteration() * schedule.iterations()

    while not stop.is_set() and n != 0:
        n -= 1
        effect.tick()

    effect.finalize()

    stop.set()
    done.signal()

    logging.info("Iterations runner done")


class Planner(object):
    def __init__(self, schedule):
        self._schedule = schedule
        self._stop_event = threading.Event()

        self._done_counter = None
        self._threads = []

    def execute(self, effects, done_event):
        # Spawn player threads
        self._done_counter = CountingEvent(done_event, len(effects))
        self._threads = self.create_threads(effects)

        self.before_start(self._schedule)

        # Start the threads
        for thread in self._threads:
            LOG.info("Starting effect: {}".format(thread.getName()))
            thread.start()

    def before_start(self, schedule):
        pass

    def create_threads(self, effects):
        return [
            threading.Thread(target=self.scheduler_for(index),
                             args=(effect, self._schedule, self._stop_event, self._done_counter),
                             name='effect-{}-{}'.format(index, effect.__class__.__name__)
                             )
            for (index, effect) in enumerate(effects)]

    def stop(self):
        if self._stop_event is None:
            return

        logging.info("Stopping effects ...")
        self._stop_event.set()
        for t in self._threads:
            t.join()

        logging.info("All effects stopped")
        self._stop_event = None

    def scheduler_for(self, index):
        raise SubclassResponsibility()


class IterationPlanner(Planner):
    def scheduler_for(self, n):
        if n == 0:
            return effect_runner_iterations
        else:
            return effect_runner_continuous


class DurationPlanner(Planner):
    def before_start(self, schedule):

        LOG.info('Starting duration timer for: {}ms'.format(schedule.duration()))
        t = threading.Timer(schedule.duration() / 1000, lambda: self.stop())
        t.start()

    def scheduler_for(self, index):
        return effect_runner_continuous


class SchedulePlannerCreator:
    def visit(self, schedule):
        return schedule.accept(self)

    def visitScheduleDuration(self, s):
        return DurationPlanner(s)

    def visitScheduleIterations(self, s):
        return IterationPlanner(s)


def for_schedule(schedule):
    return SchedulePlannerCreator().visit(schedule)

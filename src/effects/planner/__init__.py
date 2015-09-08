from .configuration import for_schedule as for_configuration_schedule
from .program import for_schedule as for_program_schedule

__author__ = 'Arjen'

def for_configuration(conf):
    return for_configuration_schedule(conf.schedule())


def for_program(program):
    return for_program_schedule(program.schedule())
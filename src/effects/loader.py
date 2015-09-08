import hashlib
import logging
import os
from model import EffectDescriptor


class EffectLoader:
    def __init__(self, directory):
        self._directory = os.path.join(os.path.dirname(__file__), directory)
        self._package = directory
        self._modules = {}

    def load_from_file(self, filename):
        mod_name = filename[:-3]

        try:
            if self.is_loaded(mod_name):
                if self.get_module(mod_name).hash == self.hash_of_file(filename):
                    logging.debug('No need to reload, module unchanged')
                else:
                    module = reload(self.get_module(mod_name))
                    module.hash = self.hash_of_file((filename))

            logging.info(" - %s" % mod_name)

            _tmp = __import__('effects.repository', globals(), locals(), [mod_name])
            mod = getattr(_tmp, mod_name)

            assert hasattr(mod, 'effect')
            assert isinstance(mod.effect, object)

            # Register file
            mod.hash = self.hash_of_file(filename)
            self._modules[mod_name] = mod

        except Exception, e:
            del self._modules[mod_name]

            logging.error("Could not load module %s"%mod_name)
            logging.exception(e)

            return False

        return True

    def load_all(self):
        logging.info("Loading effects")
        for f in os.listdir(self._directory):
            if os.path.isfile(self.full_path(f)) and f.endswith('.py') and not f == '__init__.py':
                self.load_from_file(f)

    def full_path(self, f):
        return os.path.join(self._directory, f)

    def is_loaded(self, mod_name):
        return mod_name in self._modules

    def hash_of_file(self, filename):
        md5 = hashlib.md5()
        with open(self.full_path(filename), 'r') as f:
            while True:
                data = f.read()
                if not data:
                    break
                md5.update(data)

        return md5.digest()

    def reload_all(self):
        for module in self._modules.values():
            reload(module)

    def get_module(self, effect_name):
        for mod in self._modules.values():
            if mod.effect.definition().name() == effect_name:
                return mod

        return None

    def all_definitions(self):
        return [mod.effect.definition() for mod in self._modules.values()]
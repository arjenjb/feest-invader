import hashlib
import logging
import os


class EffectLoader:
    def __init__(self, directory):
        self._directory = os.path.join(os.path.dirname(__file__), directory)
        self._package = directory
        self._effects = {}

    def load_from_file(self, filename):
        mod_name = filename[:-3]

        try:
            if self.is_loaded(mod_name):
                if self.get(mod_name).hash == self.hash_of_file(filename):
                    logging.debug('No need to reload, module unchanged')
                else:
                    module = reload(self.get(mod_name))
                    module.hash = self.hash_of_file((filename))

            logging.info("Trying to load module %s" % mod_name)

            _tmp = __import__('effects.repository', globals(), locals(), [mod_name])
            mod = getattr(_tmp, mod_name)

            assert hasattr(mod, 'effects')
            assert isinstance(mod.effects, list)

            # Register file
            mod.hash = self.hash_of_file(filename)
            self._effects[mod_name] = mod

            logging.info(" - %s"%mod_name)

        except Exception, e:
            del self._effects[mod_name]

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
        return mod_name in self._effects

    def get(self, mod_name):
        return self._effects[mod_name]

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
        for module in self._effects.values():
            reload(module)

    def all(self):
        return self._effects
from effects.repository.knipper import SineWave

__author__ = 'Arjen'

s = SineWave(1,255,3.0)

for i in range(1, 1000):
    print '='*int(s.next())

from effects.repository.knipper import SineWave

__author__ = 'Arjen'

s = SineWave(upper=100.0, lower=50.0, step=0.2)

for i in range(int((200 - 100) / 0.2)):
    print s.next()
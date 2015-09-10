define([
        'model/Program',
        'model/EffectDefinition',
        'model/EffectConfiguration',
        'model/Effect',
        'model/ParameterFactory',
        'model/Mode',
        'tools/random',
        'tools/validator'
], function(Program, EffectDescriptor, EffectConfiguration, Effect, ParameterFactory, Mode, random, validator) {

	function AccessBase() {
		this.listeners = {
			programChanged: [],
			programAdded: [],
			programRemoved: [],

            programsLoaded: [],
            modeChanged: []
		};

        this._mode = [];
		this._effects = [];
		this._programs = [];
	}

    AccessBase.remote = function(client) {
        ab = new AccessBase();

        // Loading initial data
        var programsPromise = client.programs(ab);
        var effectsPromise = client.effects(ab);
        var modePromise = client.mode(ab);

        $.when(programsPromise, effectsPromise, modePromise).then(function(programs, effects, mode) {
            ab._programs = programs;
            ab._effects = effects;
            ab._mode = mode;

            ab.notifyListeners('programsLoaded')
        });

        ab.addListener('modeChanged', function(from, to) {
            client.setMode(to);
        });

        ab.addListener('programChanged', function(from, to) {
            client.addProgram(to);
        });

        ab.addListener('programAdded', function(added) {
            client.addProgram(added);
        });

        ab.addListener('programRemoved', function(program) {
            client.removeProgram(program);
        });

        return ab;
    };

	AccessBase.mock = function() {
		var accessBase = new AccessBase();

		accessBase._effects = [
			EffectDescriptor.new('entropy', ['contour', 'wings']),
			EffectDescriptor.new('knipper', ['contour']),
			EffectDescriptor.new('fader body', ['fader'], [
                ParameterFactory.number('upper_bound', {max: 255}),
                ParameterFactory.number('lower_bound', {max: 255})
            ]),
			EffectDescriptor.new('alternate body', ['fader'], [ParameterFactory.choice('mode', {choices: ['fadein', 'fadeout', 'onoff']})]),
			EffectDescriptor.new('alternate wings', ['wings']),
			EffectDescriptor.new('loop omlaag', ['wings']),
			EffectDescriptor.new('loop omhoog', ['wings']),
			EffectDescriptor.new('random wings', ['wings'])
		];

		for (var i = 0; i < 5; i++) {
			var program = Program.withName(random.effectName(), accessBase);

			for (var j = 0; j < Math.random() * 2; j++) {
				config = EffectConfiguration.effects([random.element(accessBase.effectNames())], accessBase);
				program = program.withConfiguration(config)
			}

			accessBase._programs.push(program)
		}

		return accessBase;
	};

	AccessBase.prototype.effects = function() {
		return this._effects;
	};

    AccessBase.prototype.effectNames = function() {
        return this._effects.map(function(each) {
            return each.name();
        });
    };

	AccessBase.prototype.getEffectDefinitionByName = function(name) {
		var effect = this.effects().find(function(each) { return each.name() == name; });
        if (effect == null) {
            console.warn("EffectDefinition named '" + name + "' not found");
        }

        return effect;
	};

    AccessBase.prototype.programs = function(){
        return this._programs;
    };

    AccessBase.prototype.programsSorted = function(){
        return Array.prototype.slice.call(this.programs())
            .sort(function(a, b) {
                if (a.target() != null) {
                    if (b.target() != null) {
                        return ((a.target() < b.target()) ? -1 : ((a.target() > b.target()) ? 1 : 0));
                    } else {
                        return -1;
                    }
                } else if (b.target() != null) {
                    return 1;
                }

                return ((a.name() < b.name()) ? -1 : ((a.name() > b.name()) ? 1 : 0));
            });
    };

    AccessBase.prototype.getProgramByUid = function(uid) {
        var program = this.programs().find(function(each) { return each.uid() == uid; });
        console.assert(program != null, "Program with uid '"+uid+"' not found");

        return program;
    };

    AccessBase.prototype.addProgram = function(program) {
		this._programs.push(program);
		this.notifyListeners('programAdded', program);
	};

    AccessBase.prototype.removeProgram = function(program) {
        this._programs = this._programs.filter(function(each) {
            return each.uid() != program.uid()
        });

        this.notifyListeners('programRemoved', program);
    };

	AccessBase.prototype.updateProgram = function(from, to) {
		this._programs = this._programs.filter(function(each) {
			return each.uid() != from.uid()
		});

        if (to !== null) {
            this._programs.push(to);
        }

		this.notifyListeners('programChanged', from, to);
	};

    AccessBase.prototype.programWithAllReferers = function(base) {
        var refs = [];
        var todo = [base];
        var self = this;

        while (todo.length) {
            var target = todo.shift();
            refs.push(target);

            this
                .programs()
                .filter(function(program) {
                    return program
                        .configurations()
                        .find(function(configuration) {
                                return configuration
                                    .effects()
                                    .find(function(effect) {
                                        var definition = self.getEffectDefinitionByName(effect.name());
                                        return definition && definition
                                            .parameters()
                                            // Find program parameters
                                            .filter(function(param) {
                                                return param.type() == 'program';
                                            })
                                            // Get the parameter value from the effect
                                            .map(function(param) {
                                                return effect.getParameterValue(param.name())
                                            })
                                            // Filter out all null values
                                            .find(function(program_uid) {
                                                return program_uid == program.uid();
                                            }) != null;
                                    }) != null;
                        }) != null;
                })
                .filter(function(program) {
                   return (! (refs.find(function(o) { return o.uid() == program.uid(); })
                            || todo.find(function(o) { return o.uid() == program.uid(); })));
                })
                .forEach(Array.prototype.push, todo);
        }

        return refs;
    };

    // Configurations
    AccessBase.prototype.setScheduleForConfig = function(config, schedule) {
        validator.argument
            .objectType('config', config, EffectConfiguration)

        var newConfig = config.withSchedule(schedule);
        var newProgram = config.replaceInProgramWith(newConfig);

        this.updateProgram(newProgram, newProgram);
    };

    AccessBase.prototype.updateEffectInConfig = function(config, oldEffect, newEffect) {
        validator.argument
            .objectType('oldEffect', oldEffect, Effect)
            .objectTypeOrNull('newEffect', newEffect, Effect);

        var newConfig = (! newEffect)
            ? config.withoutEffect(oldEffect)
            : config.replaceEffect(oldEffect, newEffect);

        var newProgram = (newConfig.effects().length == 0)
            ? config.replaceInProgramWith(null)
            : config.replaceInProgramWith(newConfig);

        this.updateProgram(newProgram, newProgram);
    };

    AccessBase.prototype.addEffectInConfig = function(config, effect) {
        validator.argument
            .objectType('effect', effect, Effect);

        var newConfig = config.withEffect(effect);
        var newProgram = config.replaceInProgramWith(newConfig);

        this.updateProgram(newProgram, newProgram);
    };

    //
    // Stop/Play
    //

    AccessBase.prototype.stop = function() {
        this.setMode(Mode.stop())
    },

    AccessBase.prototype.setMode = function(to) {
        var from = this._mode;
        this._mode = to;

        this.notifyListeners('modeChanged', from, to);
    };

	AccessBase.prototype.addListener = function(eventName, callback) {
        this.listeners[eventName].push(callback);
	};

	AccessBase.prototype.notifyListeners = function(eventName){
        var args =  Array.prototype.slice.call(arguments, 1);
        this.listeners[eventName].forEach(function(each) {
            if (args.length == 0) {
                each();
            } else if (args.length == 1) {
                each(args[0]);
            } else if (args.length == 2) {
                each(args[0], args[1])
            }
		});
	};

	return AccessBase;
});
define([
    'tools/random',
    'tools/json',
    'tools/collections',
    'model/EffectConfiguration'
], function(random, json, collections, EffectConfiguration) {

    var mapping = {'configurations': EffectConfiguration};

	function Program(data, accessBase) {
		this._data = data;
		this.accessBase = accessBase;

        this._data.configurations.forEach(function(each) {
            each._program = this;
        }.bind(this))
	}

    Program.withName = function(name, accessBase) {
		return new Program({
			uid: random.guid(),
			name: name,
			configurations: [],
            schedule: 'sequence',
            target: null
		}, accessBase)
	};

    Program.fromJSON = function(object, accessBase) {
        return new Program(json.unmarshall(object, mapping, accessBase), accessBase)
    };

    Program.prototype = {

		clone: function() {
			return new Program($.extend({}, this._data), this.accessBase);
		},

		uid: function() {
			return this._data.uid;
		},

        schedule: function() {
            return this._data.schedule;
        },

        name: function() {
			return this._data.name;
		},

        withName: function(name) {
            var data = this.clone();
            data._data.name = name;
            return data;
        },

        target: function() {
            return this._data.target;
        },

        withTarget: function(target) {
            var data = this.clone();
            data._data.target = !target || target.trim() == '' ? null : target;
            return data;
        },

        configurations: function() {
            return this._data.configurations;
		},

        configurationsSorted: function() {
            return Array.prototype.slice.call(this.configurations()).sort(function(a, b) {
                return a.index() - b.index();
            });
        },

        updateConfiguration: function(oldObj, newObj) {
            return this
                .withoutConfiguration(oldObj)
                .withConfiguration(newObj);
        },

        withoutConfiguration: function(config) {
            var obj = this.clone();
            obj._data.configurations = obj.configurations().filter(function(each) {
                return each.uid() != config.uid();
            });

            return obj;
        },

		withConfiguration: function(config) {
            if (config.index() < 0) {
                var index = this.configurations().reduce(function (previous, element) {
                    return Math.max(previous, element.index());
                }, 0);

                config._data.index = index + 1;

            } else {
                console.assert(
                    this.configurations().every(function(each) { return each.index() != config.index(); }),
                    "A configuration with the given index already exists"
                );
            }

			var obj = this.clone();
			obj._data.configurations.push(config);
			config._program = obj;

			return obj;
		},

        withSchedule: function(schedule) {
            var clone = this.clone();
            clone._data.schedule = schedule;

            return clone;
        },

        getUsedComponents: function () {
            var list = this.configurations().reduce(function (prev, element) {
                return prev.concat(element.getUsedComponents());
            }, []);

            return collections.unique(list)
        },

        toJSON: function() {
            return json.marshall(this._data, mapping);
        }
	};

	return Program;
});
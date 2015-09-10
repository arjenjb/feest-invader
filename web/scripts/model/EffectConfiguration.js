define([
    'tools/random',
    'tools/json',
    'tools/validator',
    'tools/collections',
    'model/Effect',
    'model/Schedule',
    'model/Components'
], function (random, json, validator, collections, Effect, Schedule, Components) {

    var mapping = {
        'effects': Effect,
        'schedule': Schedule
    };

    function EffectConfiguration(data, accessBase) {
        this._data = data;
        this.accessBase = accessBase;
    }

    EffectConfiguration.effects = function (effects, accessBase) {
        return new EffectConfiguration({
            uid: random.guid(),
            effects: effects,
            index: -1,
            schedule: null
        }, accessBase);
    };

    EffectConfiguration.prototype.toJSON = function () {
        return json.marshall(this._data, mapping);
    };

    EffectConfiguration.fromJSON = function (object, accessBase) {
        return new EffectConfiguration(
            json.unmarshall(object, mapping, accessBase),
            accessBase
        );
    };

    //
    // Utilities
    //

    EffectConfiguration.prototype.clone = function () {
        return new EffectConfiguration(jQuery.extend({}, this._data), this.accessBase);
    };

    //
    // Accessing
    //

    EffectConfiguration.prototype.uid = function () {
        return this._data.uid;
    };

    EffectConfiguration.prototype.index = function () {
        return this._data.index;
    };

    EffectConfiguration.prototype.schedule = function () {
        return this._data.schedule;
    };

    EffectConfiguration.prototype.withSchedule = function (schedule) {
        var clone = this.clone();
        clone._data.schedule = schedule;

        return clone;
    };

    EffectConfiguration.prototype.program = function () {
        return this.accessBase.getProgramByUid(this._program.uid());
    };

    EffectConfiguration.prototype.replaceInProgramWith = function (config) {
        if (!config) {
            return this.program().withoutConfiguration(this);
        } else {
            return this.program().updateConfiguration(this, config);
        }
    };

    //
    // Effects
    //

    EffectConfiguration.prototype.effects = function () {
        return this._data.effects;
    };


    EffectConfiguration.prototype.effectsSorted = function () {
        return Array.prototype.slice.call(this.effects())
            .sort(function(a, b) {
                return a.index() - b.index();
            });
    };

    EffectConfiguration.prototype.effectDefinitions = function () {
        return this._data.effects
            .filter(function(each) { return each.name() != ''; })
            .map(function(each) {
                return this.accessBase.getEffectDefinitionByName(each.name());
            }.bind(this));
    };

    EffectConfiguration.prototype.withEffect = function (effect) {
        validator.argument
            .objectType('effect', effect, Effect);

        if (effect.index() < 0) {
            var index = this.effects().reduce(function (previous, element) {
                return Math.max(previous, element.index());
            }, 0);

            effect._data.index = index + 1;
        }

        var obj = this.clone();
        obj._data.effects.push(effect);

        return obj;
    };

    EffectConfiguration.prototype.withoutEffect = function (effect) {
        var obj = this.clone();
        obj._data.effects = obj._data.effects.filter(function (each) {
            return each.uid() != effect.uid();
        });

        return obj;
    };

    EffectConfiguration.prototype.replaceEffect = function (from, to) {
        return this.withoutEffect(from).withEffect(to);
    };

    //
    // Components
    //

    EffectConfiguration.prototype.getUsedComponents = function () {
        var accessBase = this.accessBase;
        var list = this.effects().reduce(function (prev, element) {
            return prev.concat(element.getUsedComponents(accessBase));
        }, []);

        return collections.unique(list)
    };

    EffectConfiguration.prototype.getUnusedComponents = function () {
        var used = this.getUsedComponents();
        var unused = Components.all();

        return unused.filter(function (each) {
            return used.indexOf(each) == -1
        });
    };

    return EffectConfiguration;
});
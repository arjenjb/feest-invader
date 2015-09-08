define(['tools/random', 'tools/json', 'model/ParameterValue', 'model/Schedule'], function (random, json, ParameterValue, Schedule) {

    var mapping = {
        'parameters': ParameterValue,
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

    EffectConfiguration.prototype.schedule = function() {
        return this._data.schedule;
    };

    EffectConfiguration.prototype.withSchedule = function(schedule) {
        var clone = this.clone();
        clone._data.schedule = schedule;

        return clone;
    };

    EffectConfiguration.prototype.program = function() {
        return this.accessBase.getProgramByUid(this._program.uid());
    };

    EffectConfiguration.prototype.replaceInProgramWith = function(config) {
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
        return this._data.effects
            .map(function (each) { return this.getEffectByName(each) }.bind(this.accessBase))
            .filter(function (each) { return each != null });
    };

    EffectConfiguration.prototype.effectNames = function () {
        return this._data.effects;
    };

    EffectConfiguration.prototype.withEffect = function (effectName) {
        var obj = this.clone();
        obj._data.effects.push(effectName);

        return obj;
    };

    EffectConfiguration.prototype.withoutEffect = function (effectName) {
        var obj = this.clone();
        obj._data.effects = obj._data.effects.filter(function (each) {
            return each != effectName;
        });

        return obj;
    };

    EffectConfiguration.prototype.replaceEffect = function (from, to) {
        return this.withoutEffect(from).withEffect(to);
    };

    //
    // Componetns
    //

    EffectConfiguration.prototype.getUsedCompontents = function () {
        return this.effects().reduce(function (prev, element) {
            return prev.concat(element.components());
        }, []);
    };

    EffectConfiguration.prototype.getUnusedComponents = function () {
        var used = this.getUsedCompontents();
        var unused = ['wings', 'contour', 'fader'];

        return unused.filter(function (each) {
            return used.indexOf(each) == -1
        });
    };

    //
    // Parameters
    //

    return EffectConfiguration;
});
define(['tools/random', 'tools/json', 'model/ParameterValue'], function (random, json, ParameterValue) {

    var mapping = {'parameters': ParameterValue};

    function EffectConfiguration(data, accessBase) {
        this._data = data;
        this.accessBase = accessBase;
    }

    EffectConfiguration.effects = function (effects, accessBase) {
        return new EffectConfiguration({
            uid: random.guid(),
            effects: effects,
            index: -1,
            parameters: []
        }, accessBase);
    };

    EffectConfiguration.fromJSON = function (object, accessBase) {
        return new EffectConfiguration(
            json.unmarshall(object, mapping, accessBase),
            accessBase
        );
    };

    EffectConfiguration.prototype.clone = function () {
        return new EffectConfiguration(jQuery.extend({}, this._data), this.accessBase);
    };

    EffectConfiguration.prototype.uid = function () {
        return this._data.uid;
    };

    EffectConfiguration.prototype.index = function () {
        return this._data.index;
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

    EffectConfiguration.prototype.parameters = function () {
        return this._data.parameters;
    };

    EffectConfiguration.prototype.getParameter = function(effect, name) {
        return this.parameters().find(function (each) {
            return each.effect() == effect && each.name() == name;
        });
    };

    EffectConfiguration.prototype.getParameterValue = function(effect, name) {
        var param = this.getParameter(effect, name);
        return param ? param.value() : null;
    };

    EffectConfiguration.prototype.withParameters = function (parameters) {
        var config = this.clone();
        config._data.parameters = parameters;

        return config;
    };

    EffectConfiguration.prototype.withParameter = function (effect, name, value) {
        var parameters = this._data.parameters.filter(function (each) {
            return ! (each.effect() == effect && each.name() == name);
        });
        parameters.push(ParameterValue.new(effect, name, value));

        return this.withParameters(parameters);
    };

    EffectConfiguration.prototype.toJSON = function () {
        return json.marshall(this._data, mapping);
    };

    return EffectConfiguration;
});
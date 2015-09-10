define(['tools/random', 'tools/json', 'model/ParameterValue'], function (random, json, ParameterValue) {

    var mapping = {
        'parameters': ParameterValue
    };

    function Effect(data) {
        this._data = data;
    }

    Effect.new = function (name) {
        return new Effect({
            uid: random.guid(),
            name: name,
            index: -1,
            parameters: []
        });
    };

    //
    // Utilities
    //

    Effect.fromJSON = function (object, accessBase) {
        return new Effect(json.unmarshall(object, mapping, accessBase));
    };

    Effect.prototype.toJSON = function () {
        return json.marshall(this._data, mapping);
    };

    Effect.prototype.clone = function () {
        return new Effect(jQuery.extend({}, this._data));
    };

    //
    // Accessing
    //

    Effect.prototype.uid = function () {
        return this._data.uid;
    };

    Effect.prototype.index = function () {
        return this._data.index;
    };

    Effect.prototype.name = function () {
        return this._data.name;
    };

    Effect.prototype.parameters = function () {
        return this._data.parameters;
    };

    Effect.prototype.getParameterValue = function (name) {
        var param = this.parameters().find(function (each) {
            return each.name() == name;
        });
        return (param) ? param.value() : null;
    };

    Effect.prototype.updateParameter = function(parameter) {
        var clone = this.clone();

        // first remove it
        clone._data.parameters = this.parameters().filter(function(each) {
            return each.name() != parameter.name();
        });

        // now append it
        clone._data.parameters.push(parameter);

        return clone;
    };

    Effect.prototype.getUsedComponents = function(accessBase) {
        if (this.name() == 'program') {
            var uid = this.getParameterValue('program');
            if (! uid) return [];
            var program = accessBase.getProgramByUid(uid);
            if (! program) return [];
            return program.getUsedComponents();
        } else {
            return accessBase.getEffectDefinitionByName(this.name()).components();
        }
    };

    return Effect;
});
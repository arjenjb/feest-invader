define(function() {

    var ParameterValue = function(data) {
        this._data = data;
    };

    ParameterValue.new = function(effect, name, value) {
        return new ParameterValue({
            effect: effect,
            name: name,
            value: value
        })
    };

    ParameterValue.fromJSON = function(data) {
        return new ParameterValue(data);
    };

    ParameterValue.prototype.effect = function () {
        return this._data.effect;
    }

    ParameterValue.prototype.name = function() {
        return this._data.name;
    };

    ParameterValue.prototype.value = function() {
        return this._data.value;
    };

    ParameterValue.prototype.toJSON = function() {
        return this._data;
    };

    return ParameterValue;
});
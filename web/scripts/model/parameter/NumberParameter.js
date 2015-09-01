define(['model/ParameterDefinition'], function($super) {

    function NumberParameter(name, options) {
        var max = 'max' in options && options['max'] || -1;

        $super.call(this, {
            name: name,
            type: 'number',
            max: max
        });
    }

    NumberParameter.prototype = Object.create($super.prototype);
    NumberParameter.prototype.constructor = NumberParameter;

    NumberParameter.prototype.max = function() {
        return this._data.max;
    };

    return NumberParameter;
});
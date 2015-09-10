define(['require'], function(require) {

    function ParameterDefinition(data) {
        this._data = data;
    }

    ParameterDefinition.new = function(name, type, options) {
        return new ParameterDefinition({
            name: name,
            type: type,
            options: options
        })
    };

    ParameterDefinition.fromJSON = function(object) {
        var type = object['type'];
        var className = 'model/parameter/'+(type.charAt(0).toUpperCase() + type.slice(1)) + 'Parameter';
        var classType = require(className);

        return new classType(object['name'], object['options']);
    };

    ParameterDefinition.prototype.name = function() {
        return this._data.name;
    };

    ParameterDefinition.prototype.type = function() {
        return this._data.type;
    };

    ParameterDefinition.prototype.accept = function(visitor) {
        var method = 'visit'+this.constructor.name;
        console.assert(method in visitor, 'Method ' + method + '() not defined on visitor ' + visitor.constructor.name);
        return visitor[method].call(visitor, this);
    };

    return ParameterDefinition;
});
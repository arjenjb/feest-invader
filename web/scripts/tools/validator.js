define([], function() {
    function BaseValidator() {

    }

    BaseValidator.prototype.labelOf = function (name) {
        return 'The value of ' + name
    };

    BaseValidator.prototype.basicType = function(name, value, type) {
        console.assert(typeof value == type, this.labelOf(name) + ' was expected to be of type ' + type + ', but got ' + typeof value + ' instead');
        return this;
    };

    BaseValidator.prototype.objectType = function(name, value, type) {
        console.assert(typeof value == 'object' && value.constructor == type , this.labelOf(name) + ' was expected to be of type ' + type + ', but got ' + typeof value + ' instead');
        return this;
    };

    BaseValidator.prototype.typeStringOrNull = function(name, value) {
        if (value === null) return this;
        return this.typeString(name, value);
    };

    BaseValidator.prototype.typeString = function(name, value) {
        return this.basicType(name, value, 'string');
    };

    BaseValidator.prototype.typeArrayOrNull = function(name, value, elementType) {
        if (value == null) return this;
        return this.typeArray(name, value, elementType);
    };

    BaseValidator.prototype.typeArray = function(name, value, elementType) {
        this.objectType(name, value, Array);

        if (elementType !== undefined) {
            for (var i = 0; i < value; i++) {
                self.type(name+'['+i+']', value[i], elementType);
            }
        }

        return this;
    };

    function ArgumentValidator() {}
    ArgumentValidator.prototype = Object.create(BaseValidator.prototype);
    ArgumentValidator.prototype.constructor = ArgumentValidator;

    ArgumentValidator.prototype.labelOf = function(name) {
        return 'The argument ' + name;
    };

    return {
        argument: new ArgumentValidator()
    };
});
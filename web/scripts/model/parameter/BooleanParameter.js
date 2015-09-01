define(['model/ParameterDefinition'], function($super) {

    function BooleanParameter(name, options) {
        $super.call(this, {
            name: name,
            type: 'boolean'
        });
    }

    BooleanParameter.prototype = Object.create($super.prototype);
    BooleanParameter.prototype.constructor = BooleanParameter;

    return BooleanParameter;
});
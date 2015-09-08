define(['model/ParameterDefinition'], function($super) {

    function ProgramParameter(name, options) {
        $super.call(this, {
            name: name,
            type: 'program'
        });
    }

    ProgramParameter.prototype = Object.create($super.prototype);
    ProgramParameter.prototype.constructor = ProgramParameter;

    return ProgramParameter;
});
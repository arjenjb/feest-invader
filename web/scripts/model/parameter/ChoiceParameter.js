define(['model/ParameterDefinition'], function($super) {

    function ChoiceParameter(name, options) {
        var choices = 'choices' in options && options['choices'] || -1;

        $super.call(this, {
            name: name,
            type: 'choices',
            choices: choices
        });
    }

    ChoiceParameter.prototype = Object.create($super.prototype);
    ChoiceParameter.prototype.constructor = ChoiceParameter;

    ChoiceParameter.prototype.choices  = function() {
        return this._data.choices;
    };

    return ChoiceParameter;
});
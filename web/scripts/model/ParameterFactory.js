define([
    'model/parameter/NumberParameter',
    'model/parameter/ChoiceParameter',
    'model/parameter/BooleanParameter',
    'model/parameter/ProgramParameter'
], function(NumberParameter, ChoiceParameter, BooleanParameter, ProgramParameter) {

    return {
        number: function(name, options) {
            return new NumberParameter(name, options);
        },

        choice: function(name, options) {
            return new ChoiceParameter(name, options);
        },

        boolean: function(name, options) {
            return new BooleanParameter(name, options);
        },

        boolean: function(name, options) {
            return new ProgramParameter(name, options);
        }
    }
});
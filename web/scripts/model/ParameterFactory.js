define([
    'model/parameter/NumberParameter',
    'model/parameter/ChoiceParameter',
    'model/parameter/BooleanParameter'
], function(NumberParameter, ChoiceParameter, BooleanParameter) {

    return {
        number: function(name, options) {
            return new NumberParameter(name, options);
        },

        choice: function(name, options) {
            return new ChoiceParameter(name, options);
        },

        boolean: function(name, options) {
            return new BooleanParameter(name, options);
        }
    }
});
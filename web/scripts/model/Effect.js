
define([
    'tools/validator',
    'tools/json',
    'model/ParameterDefinition'
], function(validator, json, ParameterDefinition) {

    var mapping = {
        'parameters': ParameterDefinition
    };

	function Effect(data) {
		this._data = data;
	}

	Effect.new = function(name, components, parameters) {
		validator.argument
			.typeString('name', name)
			.typeArray('components', components, 'string')
			.typeArrayOrNull('parameters', parameters, ParameterDefinition);

		return new Effect({
			name: name,
			components: components,
			parameters: (parameters || [])
		})
	};

	Effect.fromJSON = function(object) {
        return new Effect(json.unmarshall(object, mapping, null))
	};

	Effect.prototype = {
		name: function() {
			return this._data.name;
		},

		components: function() {
			return this._data.components;
		},

		parameters: function() {
			return this._data.parameters;
		}
	};

	return Effect;
});
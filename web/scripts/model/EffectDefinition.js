
define([
    'tools/validator',
    'tools/json',
    'model/ParameterDefinition'
], function(validator, json, ParameterDefinition) {

    var mapping = {
        'parameters': ParameterDefinition
    };

	function EffectDefinition(data) {
		this._data = data;
	}

	EffectDefinition.new = function(name, components, parameters) {
		validator.argument
			.typeString('name', name)
			.typeArray('components', components, 'string')
			.typeArrayOrNull('parameters', parameters, ParameterDefinition);

		return new EffectDefinition({
			name: name,
			components: components,
			parameters: (parameters || [])
		})
	};

	EffectDefinition.fromJSON = function(object) {
        return new EffectDefinition(json.unmarshall(object, mapping, null))
	};

	EffectDefinition.prototype = {
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

	return EffectDefinition;
});
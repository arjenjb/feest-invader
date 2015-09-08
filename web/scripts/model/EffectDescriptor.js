
define([
    'tools/validator',
    'tools/json',
    'model/ParameterDefinition'
], function(validator, json, ParameterDefinition) {

    var mapping = {
        'parameters': ParameterDefinition
    };

	function EffectDescriptor(data) {
		this._data = data;
	}

	EffectDescriptor.new = function(name, components, parameters) {
		validator.argument
			.typeString('name', name)
			.typeArray('components', components, 'string')
			.typeArrayOrNull('parameters', parameters, ParameterDefinition);

		return new EffectDescriptor({
			name: name,
			components: components,
			parameters: (parameters || [])
		})
	};

	EffectDescriptor.fromJSON = function(object) {
        return new EffectDescriptor(json.unmarshall(object, mapping, null))
	};

	EffectDescriptor.prototype = {
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

	return EffectDescriptor;
});
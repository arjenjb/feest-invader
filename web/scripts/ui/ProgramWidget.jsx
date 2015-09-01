define([
	'react',
	'model/EffectConfiguration',
	'jsx!ui/component/form',
	'jsx!ui/program/ProgramConfigurationWidget'

], function(React, EffectConfiguration, form, ProgramConfigurationWidget) {

	var EffectFormWidget = React.createClass({

		getInitialState: function() {
			return {
				'effect': ''
			}
		},

		effectChoices: function() {
			return this.props.accessBase.effects().map(function(effect) {
				return { 'key': effect.name(), 'label': effect.name() }
			})
		},

		handleEffectSelected: function(effect) {
			this.setState({effect: effect})
		},

		handleSubmitClicked: function() {
			this.clear();
			this.props.onAddEffect(this.state.effect)
		},

		clear: function() {
			this.setState(this.getInitialState())
		},

		render: function() {
			return (
				<form.Form onSubmit={this.handleSubmitClicked}>
					<form.DropDown onSelect={this.handleEffectSelected} selected={this.state.effect} noneLabel='> Select effect' options={this.effectChoices()} />
					<form.Submit label="Add" />
				</form.Form>
			)
		}
	});

	return React.createClass({

		handleClose: function() {
			this.props.onClose()
		},

		handleDelete: function() {
			this.props.accessBase.deleteProgram(this.props.program)
			this.handleClose()
		},

		handleAddEffect: function(name) {
			var program = this.props.program;
			var accessBase = this.props.accessBase;

			var config = EffectConfiguration.effects([name], accessBase)
			var newProgram = program.withConfiguration(config)

			accessBase.updateProgram(program, newProgram);
		},

		renderConfiguration: function(config) {
			return (
				<ProgramConfigurationWidget key={config.index()} config={config} accessBase={this.props.accessBase} />
			)
		},

		render: function() {
			return (
				<div>
					<h2>{this.props.program.name()}</h2>
					<p>
						<a href="#" onClick={this.handleClose}>Back</a> | <a href="#" onClick={this.handleDelete}>Delete</a>
					</p>

					{this.props.program.configurationsSorted().map(function(configuration) {
						return this.renderConfiguration(configuration)
					}.bind(this))}


					<EffectFormWidget accessBase={this.props.accessBase} onAddEffect={this.handleAddEffect}/>
				</div>
			)
		}
	})

})
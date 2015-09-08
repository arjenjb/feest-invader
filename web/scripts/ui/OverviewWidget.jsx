define([
	'react',
	'model/Program',
	'jsx!ui/component/form',
	'jsx!ui/component/Table',
	'jsx!ui/Controls'
], function(React, Program, form, Table, Controls) {

	var MyForm = React.createClass({

		getInitialState: function() {
			return {name: ''};
		},

		handleNameChange: function(name) {
			this.setState({'name': name})
		},

		handleSubmit: function() {
			var data = this.state;
			this.setState(this.getInitialState());
			this.props.onSubmit(data);
		},

		render: function() {
			return (
				<form.Form onSubmit={this.handleSubmit}>
					<form.Text name="name" value={this.state.name} onChange={this.handleNameChange} />
					<form.Submit label="Add" />
				</form.Form>
			)
		}
	});

	return React.createClass({
	    openProgram: function(program) {
	      this.props.onOpenProgram(program)
	    },

		render: function() {
	      var columns = [{
	          label: 'Name', 
	          value: function(row) { return row.name() },
	          onClick: function(row) { this.openProgram(row); }
	        }
	      ];

	      var key = function(row) { return row.uid() }

	      return (
	        <div>
				<Controls accessBase={this.props.accessBase} />
				<Table className="panel" rows={this.props.programs} columns={columns} rowKey={key} onClickRow={this.openProgram} />
				<MyForm onSubmit={this.handleAddProgram} />
	        </div>
	      )
	    },

		handleAddProgram: function(data) {
	      	this.props.onAddProgram(Program.withName(data.name));
	    }
	})
});
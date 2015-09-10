define([
	'react',
	'model/Program',
	'jsx!ui/component/form',
	'jsx!ui/component/Table',
    'jsx!ui/ComponentsWidget',
	'jsx!ui/Controls'
], function(React, Program, form, Table, ComponentsWidget, Controls) {

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

		renderNameCell(program) {
			return <span>
				<span className="title">{program.name()}</span>
                <ComponentsWidget components={program.getUsedComponents()} />
			</span>
		},

		render: function() {
	      var columns = [{
	          label: 'Name', 
	          value: this.renderNameCell.bind(this),
	          onClick: function(row) { this.openProgram(row); }
	        }
	      ];

	      var key = function(row) { return row.uid() };

	      return (
	        <div>
				<Controls accessBase={this.props.accessBase} />

				<h2>Targets</h2>
				<Table
					className="panel targets"
					rows={this.props.programs.filter(function(p) { return p.target() != null; })}
					columns={columns}
					rowKey={key}
					onClickRow={this.openProgram} />

				<h2>Programs</h2>
				<Table
					className="panel"
					rows={this.props.programs.filter(function(p) { return p.target() == null; })}
					columns={columns}
					rowKey={key}
					onClickRow={this.openProgram} />

				<MyForm onSubmit={this.handleAddProgram} />
	        </div>
	      )
	    },

		handleAddProgram: function(data) {
	      	this.props.onAddProgram(Program.withName(data.name));
	    }
	})
});
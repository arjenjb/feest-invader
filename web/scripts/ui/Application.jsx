define([
  'react',
  'jsx!ui/ProgramWidget',
  'jsx!ui/OverviewWidget'
], function(React, ProgramWidget, OverviewWidget) {
  
  var Application = React.createClass({

    componentWillMount: function() {
        // if the current program did change
        this.props.accessBase.addListener('programChanged', function(from, to) {
          this.fetchPrograms();

          if (this.state.program && this.state.program.uid() == from.uid()) {
              this.openProgram(to);
          }
        }.bind(this));

      this.props.accessBase.addListener('programRemoved', function() {
        this.fetchPrograms();
      }.bind(this));

      this.props.accessBase.addListener('programAdded', function() {
        this.fetchPrograms();
      }.bind(this));

      this.props.accessBase.addListener('programsLoaded', function() {
        this.fetchPrograms();
      }.bind(this))
    },

    componentDidMount: function() {
      this.fetchPrograms();
    },

    fetchPrograms: function() {
      this.setState({programs: this.props.accessBase.programsSorted()});
    },

    getInitialState: function() {
      return {
        'program': null,
        'programs': []
      }
    },

    render: function() {
      if (this.state.program) {
        return this.renderProgram(this.state.program)
      }

      return this.renderOverview()
    },

    renderOverview: function() {
      return (
        <OverviewWidget programs={this.state.programs} accessBase={this.props.accessBase} onOpenProgram={this.openProgram} onAddProgram={this.addProgram}/>
      )
    },

    renderProgram: function(program) {
      return (
        <ProgramWidget
            accessBase={this.props.accessBase}
            onClose={this.closeProgram}
            program={program} />
      )
    },

    addProgram: function(program) {
      this.props.accessBase.addProgram(program);
      this.openProgram(program);
    },

    closeProgram: function() {
      this.openProgram(null)
    },

    openProgram: function(program) {
      this.setState({program: program})
    }
  });

  return Application
});
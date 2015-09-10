define(['react'], function(React) {

    var ProgramParameterWidget = React.createClass({
        handleValueChange: function(event) {
            this.props.onValueChange(event.target.value);
        },

        render: function() {
            return (
                <select value={this.props.value} onChange={this.handleValueChange}>
                    {this.props.choices.map(function(each) {
                        return <option value={each.value}>{each.label}</option>
                    })}
                </select>
            );
        }
    });

    var ChoiceParameterWidget = React.createClass({
        handleValueChange: function(event) {
            this.props.onValueChange(event.target.value);
        },

        render: function() {
            return (
                <select value={this.props.value} onChange={this.handleValueChange}>
                    {this.props.choices.map(function(each) {
                        return <option value={each}>{each}</option>
                    })}
                </select>
            );
        }
    });


    var NumberParameterWidget = React.createClass({
        handleValueChange: function(event) {
            this.props.onValueChange(event.target.value);
        },

        render: function() {
            var min = this.props.min || 0;
            var max = this.props.max || (1<<31 - 1);

            return (
                <div>
                    <input type="number" min={min} max={max} step="1" value={this.props.value} onChange={this.handleValueChange} size="6" />
                    <input type="range" min={min} max={max} value={this.props.value} onChange={this.handleValueChange} />
                </div>
            );
        }
    });


    var BooleanParameterWidget = React.createClass({
        handleValueChange: function(event) {
            console.log(event);
            this.props.onValueChange(event.target.checked);
        },

        render: function() {
            return (
                <input type="checkbox" checked={this.props.value} onChange={this.handleValueChange} />
            );
        }
    });


    function ParameterInputRenderer(value, onValueChange, accessBase, program) {
        this.value = value;
        this.onValueChange = onValueChange;

        // context
        this.accessBase = accessBase;
        this.program = program;
    }

    ParameterInputRenderer.prototype.visit = function(def) {
        return def.accept(this);
    };

    ParameterInputRenderer.prototype.visitProgramParameter = function(parameter) {
        var factory = React.createFactory(ProgramParameterWidget);

        var refs = this.accessBase
            .programWithAllReferers(this.program)
            .map(function(each) {return each.uid()});

        var choices = this.accessBase
            .programs()
            .filter(function(each) { return refs.indexOf(each.uid()) == -1; })
            .map(function(each) {
                return {
                    value: each.uid(),
                    label: each.name() + ' (' + each.getUsedComponents().join(', ') + ')'
                }
        });

        return factory({
            value: this.value,
            onValueChange: this.onValueChange,
            choices: choices
        });
    };

    ParameterInputRenderer.prototype.visitBooleanParameter = function(parameter) {
        var factory = React.createFactory(BooleanParameterWidget);
        return factory({
            value: this.value,
            onValueChange: this.onValueChange
        });
    };

    ParameterInputRenderer.prototype.visitNumberParameter = function(parameter) {
        var factory = React.createFactory(NumberParameterWidget);
        return factory({
            value: this.value,
            onValueChange: this.onValueChange,
            max: parameter.max()
        });
    };

    ParameterInputRenderer.prototype.visitChoiceParameter = function(parameter) {
        var factory = React.createFactory(ChoiceParameterWidget);
        return factory({
            value: this.value,
            onValueChange: this.onValueChange,
            choices: parameter.choices()
        });
    };

    return ParameterInputRenderer;
});
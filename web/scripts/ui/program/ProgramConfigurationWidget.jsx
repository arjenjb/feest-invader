define([
    'react',
    'ui/component/form',
    'tools/validator',
    'model/ParameterValue',
    'model/Mode'
    ], function(React, form, validator, ParameterValue, Mode) {

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
                    <input type="slider" min={min} max={max} value={this.props.value} onChange={this.handleValueChange} />
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


    function ParameterInputRenderer(value, onValueChange) {
        this.value = value;
        this.onValueChange = onValueChange;
    }

    ParameterInputRenderer.prototype.visit = function(def) {
        return def.accept(this);
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


    var Bordered = React.createClass({
        render: function() {
            return (
                <div className={this.props.className}>
                    {this.props.children}
                </div>
            )
        }
    });


    var Panel = React.createClass({

        changeEffect: function(choice) {
            this.props.accessBase.updateEffectInConfig(
                this.props.config,
                this.props.effect.name(),
                choice);
        },

        removeEffect: function(event) {
            event.preventDefault();

            this.props.accessBase.updateEffectInConfig(
                this.props.config,
                this.props.effect.name(),
                null);
        },

        parameterValueChanged: function(effectName, parameterName, parameterValue) {
            this.props.accessBase.updateParameterInConfig(
                this.props.config,
                effectName,
                parameterName,
                parameterValue);
        },

        renderParameterInput: function(def, value) {
            return (new ParameterInputRenderer(value, function(value) {
                this.parameterValueChanged(this.props.effect.name(), def.name(), value);
            }.bind(this))).visit(def);
        },

        renderParameters: function() {
            if (this.props.parameters.length == 0) {
                return null;
            }

            return (
                <table className="parameters">
                    <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.props.parameters.map(function(pair) {
                        var def = pair[0];
                        var value = pair[1];

                        return (
                            <tr>
                                <td>{def.name()}</td>
                                <td>{this.renderParameterInput(def, value)}</td>
                            </tr>
                        );
                    }.bind(this))}
                    </tbody>
                </table>
            )
        },

        render: function() {
            var classNames = ['box-panel'];
            var l = this.props.effect.components().length;
            classNames.push('box-' + l);

            var components = this.props.config.getUnusedComponents().concat(this.props.effect.components());
            var effects = this.props.accessBase.effects().filter(function(effect) {
                return effect.components().every(function(each) {
                    return components.indexOf(each) !== -1;
                })
            });

            var options = effects.map(function(each) {
                return {
                    value: each.name(),
                    label: each.name()
                };
            });

            return (
                <Bordered className={classNames.join(' ')}>
                    <div>
                        <a href="#" onClick={this.removeEffect} className="button-remove"><i className="fa fa-trash"></i></a>
                        <form.DropDown options={options} selected={this.props.effect.name()} onSelect={this.changeEffect} />
                        <div className="components">
                            <small>{this.props.effect.components().join(', ')}</small>
                        </div>

                        {this.renderParameters()}
                    </div>
                </Bordered>
            )
        }
    });

    /**
     * config=EffectConfiguration
     * accessBase=AccessBase
     */
    return React.createClass({
        effects: function() {
            return this.props.config.effects();
        },

        configuration: function() {
            return this.props.config;
        },

        play: function(event) {
            event.preventDefault();
            this.props.accessBase.setMode(Mode.playConfiguration(this.props.config))
        },

        addEffect: function(effect) {
            this.props.accessBase.addEffectInConfig(this.props.config, effect);
        },

        effectChoices: function(components) {
            var effects = this.props.accessBase.effects().filter(function(effect) {
                return effect.components().every(function(each) {
                    return components.indexOf(each) !== -1;
                })
            });

            var options = effects.map(function(effect) {
                return {
                    value: effect.name(),
                    label: effect.name()
                };
            });

            var appendOptions = [
                {value: '__random__', label: '[random effect]'}
            ];

            return [].concat(options, appendOptions);
        },

        keyFor: function(effectName) {
            validator.argument.typeString('effectName', effectName);
            return this.props.config.uid()+'-'+effectName;
        },

        renderSchedulePanel: function() {
            return (<div>
                <select>
                    <option value="iterations">iterations</option>
                    <option value="delay">delay (ms)</option>
                </select>
            </div>);
        },

        renderEffectPanel: function(effect) {
            var parameters = effect.parameters().map(function(definition) {
                var parameterName = definition.name();

                var value = this.configuration().getParameterValue(effect.name(), parameterName)
                    || null;

                return [definition, value];
            }.bind(this));

            return <Panel
                key={this.keyFor(effect.name())}
                effect={effect}
                parameters={parameters}
                config={this.props.config}
                accessBase={this.props.accessBase} />
        },

        renderNewEffectPanel: function() {
            var components = this.props.config.getUnusedComponents();

            if (components.length == 0) {
                return <span />;

            } else {
                var options = this.effectChoices(components);
                return (
                    <Bordered key={this.keyFor('none')} className="box-panel box-1" key="none">
                        <div>
                            <form.DropDown noneLabel="none" options={options} onSelect={this.addEffect} selected='' />
                        </div>
                    </Bordered>
                );
            }
        },

        render: function() {
            return (
                <Bordered className="configuration-box panel">
                    <div>
                        <div className="controls">
                            <a href="#" onClick={this.play}><i className="fa fa-play"></i></a>
                        </div>

                        {this.renderSchedulePane()}

                        {this.effects().map(this.renderEffectPanel)}
                        {this.renderNewEffectPanel()}
                    </div>
                </Bordered>
            )
        }
    })
});
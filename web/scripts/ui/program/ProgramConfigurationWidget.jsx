define([
    'react',
    'tools/validator',
    'ui/component/form',
    'jsx!./ParameterInputRenderer',
    'model/ParameterValue',
    'model/Mode',
    'model/Schedule'
    ], function(React, validator, form, ParameterInputRenderer, ParameterValue, Mode, Schedule) {


    var SchedulePanel = React.createClass({

        //
        // Handlers
        //
        handleTypeChanged: function(event) {
            var type = event.target.value;
            this.props.onScheduleChanged(Schedule.type(type))
        },

        render: function() {

            var type = this.props.schedule ? this.props.schedule.type() : null;

            return <div className="schedule-pane">
                {this.renderValue()}

                <select value={type} onChange={this.handleTypeChanged}>
                    <option value=""></option>
                    <option value="iterations">iterations</option>
                    <option value="duration">duration (ms)</option>
                </select>
            </div>
        },

        renderValue: function() {
            if (! this.props.schedule) {
                return <span/>

            } else if (this.props.schedule.type() == 'iterations') {
                return this.renderIterationsValue();

            } else {
                return this.renderDurationValue();
            }
        },

        renderIterationsValue: function() {
            var handleValueChanged = function(event) {
                var n = event.target.value;
                this.props.onScheduleChanged(this.props.schedule.withIterations(n));
            }.bind(this);

            return <input className="value-input" type="number" value={this.props.schedule.iterations()} placeholder="#" onChange={handleValueChanged} />
        },

        renderDurationValue: function() {
            var handleValueChanged = function(event) {
                var n = event.target.value;
                this.props.onScheduleChanged(this.props.schedule.withDuration(n));
            }.bind(this);

            return <input className="value-input" type="number" value={this.props.schedule.duration()} placeholder="milliseconds" onChange={handleValueChanged} />
        }
    });

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
    var EffectConfigurationWidget = React.createClass({
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

        handleScheduleChanged: function(schedule) {
            this.props.accessBase.setScheduleForConfig(this.props.config, schedule);
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

                        <SchedulePanel schedule={this.configuration().schedule()} onScheduleChanged={this.handleScheduleChanged} />

                        {this.effects().map(this.renderEffectPanel)}
                        {this.renderNewEffectPanel()}
                    </div>
                </Bordered>
            )
        }
    });

    return EffectConfigurationWidget;
});
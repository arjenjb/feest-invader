define([
    'react',
    'tools/validator',
    'ui/component/form',
    'jsx!./ParameterInputRenderer',
    'jsx!ui/ComponentsWidget',
    'model/ParameterValue',
    'model/Effect',
    'model/Mode',
    'model/Schedule',
    'model/Components'
    ], function(React, validator, form, ParameterInputRenderer, ComponentsWidget, ParameterValue, Effect, Mode, Schedule, Components) {


    var SchedulePanel = React.createClass({

        //
        // Handlers
        //
        handleTypeChanged: function(event) {
            var type = event.target.value;
            this.props.onScheduleChanged(Schedule.type(type))
        },

        render: function() {
            var type = this.props.schedule
                ? this.props.schedule.type()
                : null;

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

    /**
     * Props
     */
    var Panel = React.createClass({
        changeEffect: function(choice) {
            var effect = choice ? Effect.new(choice) : null;

            this.props.accessBase.updateEffectInConfig(
                this.props.config,
                this.props.effect,
                effect);
        },

        removeEffect: function(event) {
            event.preventDefault();

            this.props.accessBase.updateEffectInConfig(
                this.props.config,
                this.props.effect,
                null);
        },

        parameterValueChanged: function(parameterName, parameterValue) {
            this.props.accessBase.updateEffectInConfig(
                this.props.config,
                this.props.effect,
                this.props.effect.updateParameter(ParameterValue.new(parameterName, parameterValue)));
        },

        renderParameterInput: function(def, value) {
            var onValueChange = function(value) {
                this.parameterValueChanged(def.name(), value);
            }.bind(this);

            var visitor = new ParameterInputRenderer(
                value,
                onValueChange,
                this.props.accessBase,
                this.props.program);

            return visitor.visit(def);
        },

        renderParameters: function() {
            var parameters = this.props.definition.parameters();
            if (parameters.length == 0) {
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
                    {parameters.map(function(def) {
                        return (
                            <tr>
                                <td>{def.name()}</td>
                                <td>{this.renderParameterInput(def, this.props.effect.getParameterValue(def.name()))}</td>
                            </tr>
                        );
                    }.bind(this))}
                    </tbody>
                </table>
            )
        },

        render: function() {
            var classNames = ['box-panel'];

            var options = this.props.accessBase.effects().map(function(each) {
                return {
                    value: each.name(),
                    label: each.name()
                };
            });

            return (
                <Bordered className={classNames.join(' ')}>
                    <div>
                        <a href="#" onClick={this.removeEffect} className="button-remove"><i className="fa fa-trash"></i></a>
                        <form.DropDown options={options} selected={this.props.definition.name()} onSelect={this.changeEffect} />
                        &nbsp;
                        <small><ComponentsWidget components={this.props.effect.getUsedComponents(this.props.accessBase)} /></small>

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
            this.props.accessBase.addEffectInConfig(this.props.config, Effect.new(effect));
        },

        handleScheduleChanged: function(schedule) {
            this.props.accessBase.setScheduleForConfig(this.props.config, schedule);
        },

        effectChoices: function() {
            var effects = this.props.accessBase.effects();
            var options = effects.map(function(effect) {
                return {
                    value: effect.name(),
                    label: effect.name()
                };
            });

            var appendOptions = [
//                 {value: '__random__', label: '[random effect]'}
            ];

            return [].concat(options, appendOptions);
        },

        keyFor: function(effectName) {
            validator.argument.typeString('effectName', effectName);
            return this.props.config.uid()+'-'+effectName;
        },

        renderEffectPanel: function(effect) {
            var definition = this.props.accessBase.getEffectDefinitionByName(effect.name());

            return <Panel
                key={effect.uid()}
                effect={effect}
                definition={definition}
                program={this.props.program}
                config={this.props.config}
                accessBase={this.props.accessBase} />
        },

        renderNewEffectPanel: function() {
            var options = this.effectChoices();
            return (
                <Bordered key={this.keyFor('none')} className="box-panel box-new" key="none">
                    <div>
                        <form.DropDown noneLabel="none" options={options} onSelect={this.addEffect} selected='' />
                    </div>
                </Bordered>
            );
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
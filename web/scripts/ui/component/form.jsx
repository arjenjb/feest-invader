define(['react'], function(React) {

    var Form = React.createClass({
        handleSubmit: function (event) {
            event.preventDefault();
            this.props.onSubmit();
        },

        render: function () {
            return (
                <form onSubmit={this.handleSubmit}>
                    {this.props.children}
                </form>
            )
        }
    });

    var Submit = React.createClass({
        render: function () {
            return <input type="Submit" value={this.label()}/>
        },

        label: function () {
            return this.props.label || 'Submit'
        }
    });

    var Text = React.createClass({
        getInitialState: function() {
            return {'value': ''};
        },

        handleOnChange: function(event) {
            this.setState({'value': event.target.value});
            this.props.onChange(event.target.value);
        },

        render: function () {
            return <input type="text" value={this.state.value} onChange={this.handleOnChange} />
        }
    });

    /**
     * noneOption=String
     * options=[Promise|[{value: String, label: String}]]
     * onSelect=string
     * selected=string
     */
    var DropDown = React.createClass({
        getNoneOption: function () {
            return {value: '', label: this.props.noneLabel || '--'}
        },

        options: function () {
            return [this.getNoneOption()].concat(this.props.options)
        },

        render: function () {
            return (
                <select value={this.props.selected} onChange={this.handleOnChange}>
                    {this.options().map(function (option) {
                        return <option key={option.value} value={option.value}>{option.label}</option>
                    })}
                </select>
            )
        },

        handleOnChange: function (event) {
            this.props.onSelect(event.target.value)
        }
    });

    return {
        DropDown: DropDown,
        Submit: Submit,
        Text: Text,
        Form: Form
    };
});
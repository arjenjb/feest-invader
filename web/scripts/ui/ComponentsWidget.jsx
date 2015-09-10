define(['react'], function(React) {
    return React.createClass({
        render: function () {
            return <span className="component-list">{this.props.components.map(function (c) {
                var className = 'component component-' + c;
                return <span className={className}>{c}</span>
            })}</span>
        }
    });
});
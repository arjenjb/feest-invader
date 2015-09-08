define([
    'react'
], function(React) {

    return React.createClass({
        handleStop: function(event) {
            event.preventDefault();
            this.props.accessBase.stop()
        },

        handlePlay: function(event) {
            event.preventDefault();
            this.props.onPlay();
        },

        render: function() {
            var playWidget = null;

            if (this.props.onPlay) {
                playWidget = <a href="#" onClick={this.handlePlay}><i className="fa fa-play"></i></a>
            }

            return <div className="controls main">
                {playWidget}
                <a href="#" onClick={this.handleStop}><i className="fa fa-stop"></i></a>
            </div>
        }
    });
});

define(function() {

    var ScheduleDelay = function(data) {
        this._data = data;
        this._data['type'] = 'delay';
    };

    ScheduleDelay.new = function(n) {
        return new ScheduleDelay({
            delay: n
        })
    };

    ScheduleDelay.fromJSON = function(data) {
        return new ScheduleDelay(data);
    };

    ScheduleDelay.prototype.delay = function() {
        return this._data.delay;
    };

    ScheduleDelay.prototype.toJSON = function() {
        return this._data;
    };

    return ScheduleDelay;
});

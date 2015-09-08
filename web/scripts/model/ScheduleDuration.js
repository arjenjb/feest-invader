define(function() {

    var ScheduleDuration = function(data) {
        this._data = data;
        this._data['type'] = 'duration';
    };

    ScheduleDuration.new = function(n) {
        return new ScheduleDuration({
            duration: n||1000
        })
    };

    ScheduleDuration.fromJSON = function(data) {
        return new ScheduleDuration(data);
    };

    ScheduleDuration.prototype.type = function() {
        return this._data.type;
    };

    ScheduleDuration.prototype.duration = function() {
        return this._data.duration;
    };

    ScheduleDuration.prototype.withDuration = function(duration) {
        return ScheduleDuration.new(duration);
    };

    ScheduleDuration.prototype.toJSON = function() {
        return this._data;
    };

    return ScheduleDuration;
});

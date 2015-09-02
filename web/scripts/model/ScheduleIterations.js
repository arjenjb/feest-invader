define(function() {

    var ScheduleIterations = function(data) {
        this._data = data;
        this._data['type'] = 'iterations';
    };

    ScheduleIterations.new = function(n) {
        return new ScheduleIterations({
            iteration: n
        })
    };

    ScheduleIterations.fromJSON = function(data) {
        return new ScheduleIterations(data);
    };

    ScheduleIterations.prototype.iterations = function() {
        return this._data.iterations;
    };

    ScheduleIterations.prototype.toJSON = function() {
        return this._data;
    };

    return ScheduleIterations;
});

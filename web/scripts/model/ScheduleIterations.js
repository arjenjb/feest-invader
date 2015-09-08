define(function() {

    var ScheduleIterations = function(data) {
        this._data = data;
        this._data['type'] = 'iterations';
    };

    ScheduleIterations.new = function(n) {
        return new ScheduleIterations({
            iterations: n||1
        })
    };

    ScheduleIterations.fromJSON = function(data) {
        return new ScheduleIterations(data);
    };

    ScheduleIterations.prototype.type = function() {
        return this._data.type;
    };

    ScheduleIterations.prototype.iterations = function() {
        return this._data.iterations;
    };

    ScheduleIterations.prototype.withIterations = function(n) {
        return ScheduleIterations.new(n);
    };

    ScheduleIterations.prototype.toJSON = function() {
        return this._data;
    };

    return ScheduleIterations;
});

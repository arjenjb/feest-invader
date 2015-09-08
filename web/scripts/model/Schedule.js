define(['model/ScheduleIterations', 'model/ScheduleDuration'], function(ScheduleIterations, ScheduleDuration) {

    var map = {
        'iterations': ScheduleIterations,
        'duration': ScheduleDuration
    };

    var Schedule = function() {

    };

    Schedule.type = function(type) {
        if (! type) {
            return null;
        }
        
        return map[type].new();
    };

    Schedule.fromJSON = function(data) {
        if (! data) {
            return null;
        }
        return map[data['type']].fromJSON(data);
    };

    return Schedule;
});

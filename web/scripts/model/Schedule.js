define(['model/ScheduleIterations', 'model/ScheduleDelay'], function(ScheduleIterations, ScheduleDelay) {

    var Schedule = function() {

    };

    Schedule.fromJSON = function(data) {
        if (! data) {
            return null;
        } else if (data['type'] == 'iterations') {
            return ScheduleIterations.fromJSON(data);
        } else if (data['type'] == 'delay') {
            return ScheduleDelay.fromJSON(data);
        }

        return null;
    };

    return Schedule;
});

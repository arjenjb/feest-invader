
define(['tools/validator'], function(validator) {
    function Mode(data) {
        this._data = data;
    }

    Mode.playConfiguration = function(configuration) {

        return new Mode({
            state: 'play:configuration',
            program_uid: configuration.program().uid(),
            configuration_uid: configuration.uid()
        });
    };

    Mode.playProgram = function(program) {
        return new Mode({
            state: 'play:program',
            program_uid: program.uid()
        });
    };

    Mode.stop = function() {
        return new Mode({state: 'stop'});
    };

    Mode.fromJSON = function(obj) {
        return new Mode(obj);
    };

    Mode.prototype.toJSON = function() {
        return this._data;
    };

    return Mode;
});
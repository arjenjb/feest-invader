define([
    'model/Program',
    'model/EffectDescriptor',
    'model/Mode',
    'tools/random',
    'tools/validator'
], function(Program, EffectDescriptor, Mode, random, validator) {

    function Client(url) {
        this._url = url;
    }

    Client.prototype.effects = function(accessBase) {
        return $.get(this._url + '/effect').then(function (result) {
            return result.map(function(each) {
                return EffectDescriptor.fromJSON(each, accessBase);
            });
        });
    };

    Client.prototype.programs = function (accessBase) {
        return $.get(this._url + '/program').then(function (result) {
            return result.map(function(each) {
                return Program.fromJSON(each, accessBase);
            });
        });
    };

    Client.prototype.removeProgram = function(program) {
        $.ajax({
            url: this._url + '/program/' + program.uid(),
            type: 'DELETE'
        });
    };

    Client.prototype.addProgram = function (program) {
        $.ajax({
            url: this._url + '/program',
            type: 'POST',
            data: JSON.stringify(program.toJSON()),
            contentType: 'text/javascript'
        });
    };

    Client.prototype.mode = function() {
        return $.get(this._url + '/mode').then(function (result) {
            return Mode.fromJSON(result);
        });
    };

    Client.prototype.setMode = function(mode) {
        $.ajax({
            url: this._url + '/mode',
            type: 'POST',
            data: JSON.stringify(mode.toJSON()),
            contentType: 'text/javascript'
        });
    };

    return Client;
});
define(function() {
    return {
       marshall: function(object, mapping) {
           var obj = $.extend({}, object);
           Object.keys(mapping).forEach(function(prop) {
               if (Array.isArray(obj[prop])) {
                   obj[prop] = obj[prop].map(function(each) {
                       return each.toJSON();
                   })
               } else {
                   debugger;
               }
           });

           return obj;
       },

        unmarshall: function(object, mapping, accessBase) {
            var data = object;

            Object.keys(object).forEach(function (key) {
                if (key in mapping) {
                    var type = mapping[key];

                    if (Array.isArray(object[key])) {
                        data[key] = object[key].map(function(each) {
                            return type.fromJSON(each, accessBase);
                        });
                    } else {
                        debugger;
                    }

                }
            });

            return data;
        }
    }
});

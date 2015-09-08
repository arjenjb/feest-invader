define(function() {
    return {
       marshall: function(object, mapping) {
           var obj = $.extend({}, object);
           Object.keys(mapping).forEach(function(prop) {

               if (obj[prop] == null) {
                   return null;

               } else if (Array.isArray(obj[prop])) {
                   obj[prop] = obj[prop].map(function(each) {
                       return each.toJSON();
                   })
               } else if ('toJSON' in obj[prop]) {
                   return obj[prop].toJSON();
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

                    if (object[key] == null) {
                        return;

                    } else if (Array.isArray(object[key])) {
                        data[key] = object[key].map(function(each) {
                            return type.fromJSON(each, accessBase);
                        });
                    } else {
                        data[key] = type.fromJSON(object[key], accessBase);
                    }
                }
            });

            return data;
        }
    }
});

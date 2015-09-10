define(function() {
    return {
        unique: function (coll) {
            var newList = [];
            for (var i = 0; i < coll.length; i++) {
                var each = coll[i];
                if (newList.indexOf(each) == -1) {
                    newList.push(each);
                }
            }

            return newList;
        }
    }
});

var w = window,
    d = document;

var $ = function(element){

    var str = function(element){

            var cl = function(cl){
                    return d.getElementsByClassName(cl.substr(1));
                },
                id = function(id){
                    return [d.getElementById(id.substr(1))];
                };

            return /^\./.test(element)
                ? cl(element)
                : /^#/.test(element)
                    ? id(element)
                    : [];

        },
        obj = function(element){

            return $.check(element)
                ? element
                : []
        };

    return typeof element == 'string' || element instanceof String
        ? str(element)
        : obj(element);
};

$.check = function(obj){

    if ( obj && obj.length && typeof obj == 'object' ) {
        for ( var i = 0, l = obj.length; i < l; i++ ) {
            var isNode = obj[i] instanceof Node;
            if ( !isNode ) return false;
        }
        return true;
    }
    else {
        return false;
    }
};

$.each = function(collection, func){

    var array = this.check(collection)
            ? collection
            : this.check(this)
                ? this
                : null;

    if ( !array ) return this;

    for ( var i = 0, l = array.length; i < l; i++ ) {
        func.call(array[i]);
    }

    return this;
};

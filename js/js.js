(function(d){

    var $,
        Query,
        Utils = {};


    // Checks that each array element is Node
    Utils.check = function(obj){

        if ( obj && obj.length && typeof obj === 'object' ) {
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


    // Capitalize first letter
    Utils.capitalize = function(str){
        return str[0].toUpperCase() + str.substr(1);
    };


    // Contains userAgent
    Utils.ua = navigator.userAgent;


    // Contains information about browser and vendor prefixes
    Utils.browser = {
        msie: {
            test: /msie/i.test(Utils.ua),
            prefix: 'Ms'
        },
        webkit: {
            test: /webkit/i.test(Utils.ua),
            prefix: 'Webkit'
        },
        gecko: {
            test: /gecko/i.test(Utils.ua),
            prefix: 'Moz'
        },
        opera: {
            test: /opera/i.test(Utils.ua),
            prefix: 'O'
        },
        current: null
    };


    // Defines current browser and sets it into Utils.browser.current
    (function(b){

        for ( var a in b ) {
            if ( b[a].test ) {
                b.current = b[a];
                break;
            }
        }

    }(Utils.browser));


    // Checks that CSS3 property is supported without vendor prefix else returns that property with prefix
    Utils.vendorPrefix = function(property){

        var vendorProp = Utils.browser.current
                ? Utils.browser.current.prefix + Utils.capitalize(property)
                : property;

        return d.body[property]
            ? d.body[property]
            : d.body[vendorProp];
    };


    // Returns node collection for specified selector (class or id)
    Query = function(element){

        // TODO: improve

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

                return Utils.check(element)
                    ? element
                    : []
            };

        return typeof element === 'string' || element instanceof String
            ? str(element)
            : obj(element);

    };


    $ = function(selector){

        var elements = new Query(selector);


        // TODO: RTFM and do it better


        // Returns collection containing first element of node collection
        elements.first = function(){
            return [this[0]];
        };


        // Returns collection containing last element of node collection
        elements.last = function(){
            return [this[ this.length - 1 ]];
        };


        // Returns collection containing element with specified index of node collection
        elements.eq = function(i){
            return [this[i]];
        };


        // Goes over node collection and runs function for each element with context containing current node
        elements.each = function(collection, func){

            var isChain = arguments.length < 2,
                _collection,
                _func;

            _func = isChain
                ? arguments[0]
                : arguments[1];

            _collection = isChain
                ? this
                : collection;

            _collection = Utils.check(_collection)
                ? _collection
                : null;

            if ( !_collection || !_func ) return this;

            for ( var i = 0, l = _collection.length; i < l; i++ ) {
                _func.call(_collection[i], i, _collection[i]);
            }

            return this;
        };


        // Returns array containing inner HTML of collection elements or sets HTML to elements of node collection if argument specified
        elements.html = function(str){

            var result = [],
                getHTML = function(){
                    result.push(this.innerHTML);
                },
                setHTML = function(){
                    this.innerHTML = str;
                };

            this.each(this, str ? setHTML : getHTML);

            return str
                ? this
                : result.length === 1
                    ? result[0]
                    : result;
        };


        elements.css = function(options){

            var ex = {
                
                    background: function(){

                        var str = this,
                            color = function(){
                                return this.replace(); // /rgba\(.*\)|rgb\(.*\)|#[0-9A-Fa-f]]/ TODO: parse background
                            },
                            image = function(){
                                return this.replace();
                            },
                            position = function(){
                                return this.replace();
                            },
                            repeat = function(){
                                return this.replace();
                            };

                        return {
                            backgroundColor: color.call(str),
                            backgroundImage: image.call(str),
                            backgroundPosition: position.call(str),
                            backgroundRepeat: repeat.call(str)
                        };
                    },
                    boxShadow: function(){
                        var result = {};
                        result[Utils.vendorPrefix('boxShadow')] = this;
                    },
                    borderRadius: function(){
                        var result = {};
                        result[Utils.vendorPrefix('borderRadius')] = this;
                    },
                    size: function(){
                        return +this
                            ? this + 'px'
                            : this;
                    }
                };

            ex.width =
            ex.height =
            ex.top =
            ex.left =
            ex.right =
            ex.bottom =
            ex.marginTop =
            ex.marginBottom =
            ex.marginLeft =
            ex.marginRight =
            ex.paddingTop =
            ex.paddingBottom =
            ex.paddingLeft =
            ex.paddingRight = ex.size;

            ex.mozBoxShadow = ex.MozBoxShadow =
            ex.webkitBoxShadow = ex.WebkitBoxShadow = ex.boxShadow;

            ex.mozborderRadius = ex.MozborderRadius =
            ex.webkitBorderRadius = ex.WebkitBorderRadius = ex.borderRadius;

            this.each(this, function(){

                for ( var a in options ) {

                    var property = a,
                        value = options[a],
                        combined;

                    if ( property in ex ) {

                        combined = ex[property].call(value);

                        if ( typeof combined === 'string' ){
                            value = combined;
                        }

                        if ( typeof combined === 'object' ) {
                            for ( var b in combined ) {
                                this.style[b] = combined[b];
                            }
                            continue;
                        }
                    }
                    this.style[property] = value;
                }
            });

            return this;
        };






        return elements;
    };





    var Q = function(){
        console.log('Q init');
    };


    Q.prototype.select = function(tag){
        return d.getElementsByName(tag.toUpperCase());
    };

    Q.prototype.first = function(){
        return this[0];
    };






    window.Q = Q;
    window.$ = $;

}(document));
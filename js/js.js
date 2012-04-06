(function(d){

    var $,
        Query,
        Utils;



    Utils = {

        // Capitalize first letter
        capitalize: function(str){
            return str[0].toUpperCase() + str.substr(1);
        },

        // Trim string
        trim: function(str){
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        },

        // Checks that each array element is Node
        checkNodes: function(obj){

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

        },

        // Checks that CSS3 property is supported without vendor prefix
        // else returns that property with prefix
        setVendorPrefix: function(prop){

            var prefix,
                browser;

            for ( var a in this.browser ) {
                if ( this.browser[a].test ) {

                    prefix = this.browser[a].prefix;
                    return d.body[prop]
                        ? prop
                        : prefix + this.capitalize(prop);
                }
            }

            return prop;
        },

        // Contains information about browser and vendor prefixes
        browser: {
            msie: {
                test: /msie/i.test(this.ua),
                prefix: 'Ms'
            },
            webkit: {
                test: /webkit/i.test(this.ua),
                prefix: 'Webkit'
            },
            gecko: {
                test: /gecko/i.test(this.ua),
                prefix: 'Moz'
            },
            opera: {
                test: /opera/i.test(this.ua),
                prefix: 'O'
            }
        },
        ua: navigator.userAgent
    };





    // Returns node collection for specified selector (class or id)
    Query = function(element){

        // TODO: add selection by tag
        // TODO: use xpath, querySelectorAll etc

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

                return Utils.checkNodes(element)
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

            _collection = Utils.checkNodes(_collection)
                ? _collection
                : null;

            if ( !_collection || !_func ) return this;

            for ( var i = 0, l = _collection.length; i < l; i++ ) {
                _func.call(_collection[i], i, _collection[i]);
            }

            return this;
        };


        // Returns array containing inner HTML of collection elements or
        // sets HTML to elements of node collection if argument specified
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

            var replace = {
                
                    background: function(prop, val){

                        var re = {
                                image: /.*((?:url\(.*\)|(?:(?:-.+)?-)?.+-gradient\(.*\))).*/i,
                                position: /.*?((?:(?:-)?[0-9]+(?:px|%)?|left|right|top|bottom|center|inherit)).+?((?:(?:-)?[0-9]+(?:px|%)?|left|right|top|bottom|center|inherit)).*/i,
                                repeat: /.*(repeat|no-repeat|repeat-x|repeat-y|round|space|inherit).*/i
                            },
                            color,
                            image,
                            position,
                            repeat;

                        image = val.replace(re.image, '$1');
                        repeat = val.replace(re.repeat, '$1');
                        position = val.replace(re.position, '$1 $2');

                        // TODO: parse background color
                        // TODO: fix background image regexp
                        // TODO: improve background position regexp

                        return {
                            backgroundColor: color,
                            backgroundImage: image,
                            backgroundPosition: position,
                            backgroundRepeat: repeat
                        };
                    },
                    css3prop: function(prop, val){

                        var result = {};
                        result[Utils.setVendorPrefix(prop)] = val;
                        return result;
                    },
                    size: function(prop, val){

                        var result = {};
                        result[prop] = +val
                            ? val + 'px'
                            : val;

                        return result;
                    }
                };

            replace.width =
            replace.height =
            replace.top =
            replace.left =
            replace.right =
            replace.bottom =
            replace.marginTop =
            replace.marginBottom =
            replace.marginLeft =
            replace.marginRight =
            replace.paddingTop =
            replace.paddingBottom =
            replace.paddingLeft =
            replace.paddingRight = replace.size;

            replace.mozBoxShadow        = replace.MozBoxShadow =
            replace.webkitBoxShadow     = replace.WebkitBoxShadow =
            replace.mozborderRadius     = replace.MozborderRadius =
            replace.webkitBorderRadius  = replace.WebkitBorderRadius = replace.css3prop;

            this.each(this, function(){

                for ( var a in options ) {

                    var property = a,
                        value = options[a],
                        substitution;

                    if ( property in replace ) {

                        substitution = replace[property](property, value);

                        for ( var newProp in substitution ) {
                            this.style[newProp] = substitution[newProp];
                        }
                        continue;
                    }

                    this.style[property] = value;
                }
            });

            return this;
        };



        return elements;
    };

    window.$ = $;
    window.Utils = Utils; // temporary for debug

}(document));
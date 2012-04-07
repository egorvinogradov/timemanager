(function(d){

    var $,
        Utils,
        Query,
        Methods;



    Utils = {


        // Capitalize first letter

        capitalize: function(str){
            return str[0].toUpperCase() + str.substr(1);
        },


        // Trim string

        trim: function(str){
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        },


        // Returns array of Nodes or false
        // if any elements are not nodes

        getNodeArray: function(nodes){

            var checkNodes,
                result;

            checkNodes = function(nodes, makeArray){

                var result = [],
                    isNodes = true;

                for ( var i = 0, l = nodes.length; i < l; i++ ) {
                    var element = nodes[i],
                        isNode = element instanceof Node;
                    if ( !isNode ) {
                        isNodes = false;
                        break;
                    }
                    makeArray && result.push(element);
                }

                result = makeArray
                    ? result
                    : nodes;

                return isNodes
                    ? result
                    : false;
            };

            if ( nodes && nodes.length && nodes instanceof Object ) {

                result =
                    nodes instanceof Array && checkNodes(nodes) ||
                    nodes instanceof Node && [nodes] ||
                    checkNodes(nodes, true);

                return result
                    ? result
                    : [];
            }

            return [];
        },


        // Goes over array or object and runs function for each element
        // with defined context or context containing current element

        each: function(col, fn, cntxt){

            var notChain,
                collection,
                func,
                context,
                isIterable,
                iterateArray,
                iterateObject;

            notChain = arguments.length > 1 && arguments[1] instanceof Function;

            collection = notChain
                ? arguments[0]
                : this;

            func = notChain
                ? arguments[1]
                : arguments[0];

            context = notChain
                ? arguments[2]
                : arguments[1];

            isIterable = collection.length !== undefined || collection instanceof Object;

            iterateArray = function(){
                for ( var i = 0, l = collection.length; i < l; i++ ) {
                    func.call(context || collection[i], i, collection[i]);
                }
            };

            iterateObject = function(){
                for ( var a in collection ) {
                    func.call(context || collection[a], a, collection[a]);

                }
            };

            if ( func && collection && isIterable ) {
                collection.length !== undefined
                    ? iterateArray()
                    : iterateObject();
            }

            return collection;
        },


        // Checks that CSS3 property is supported without vendor prefix
        // else returns that property with prefix

        setVendorPrefix: function(prop){

            var prefix,
                browser;

            for ( var name in this.browser ) {
                if ( Utils.browser[name].test ) {

                    prefix = Utils.browser[name].prefix;
                    return d.body[prop]
                        ? prop
                        : prefix + this.capitalize(prop);
                }
            }

            return prop;
        },


        // Contains information about browsers and vendor prefixes

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



    // Returns node collection for specified selector

    Query = function(s, parentNode){

        var getBySelector,
            getFromNodes,
            isSelector = typeof s === 'string' || s instanceof String;

        getBySelector = function(selector){

            var getByTagName,
                getByClassName,
                getById,
                tagNameRe = /^\w+$/i,
                classNameRe = /^\.[a-z0-9-_.]+$/i,
                idRe = /^#[a-z0-9-_]+$/i,
                result;

            parentNode = parentNode || d;

            getByTagName = function(selector){
                var result = [];
                Utils.each(parentNode.getElementsByTagName(selector), function(){
                    result.push(this);
                });
                return result;
            };

            getByClassName = function(selector){
                var result = [],
                    nodes = parentNode.getElementsByClassName
                        && parentNode.getElementsByClassName(selector.substr(1));

                Utils.each(nodes, function(){
                    result.push(this);
                });
                return result;
            };

            getById = function(selector){
                var result = parentNode.getElementById(selector.substr(1));
                return result
                    ? [result]
                    : [];
            };


            // TODO: remove console log
            console.log('Node type:',
                tagNameRe.test(selector) && 'TAG  ' + selector ||
                classNameRe.test(selector) && 'CLASS  ' + selector ||
                idRe.test(selector) && 'ID  ' + selector
            );


            result =
                tagNameRe.test(selector)    && getByTagName(selector)   ||
                classNameRe.test(selector)  && getByClassName(selector) ||
                idRe.test(selector)         && getById(selector)        ||
                [];

            return result;
        };


        getFromNodes = function(nodes){

            var result = Utils.getNodeArray(nodes);
            return result
                ? result
                : [];
        };

        return isSelector
            ? getBySelector(s)
            : getFromNodes(s);
    };




    Methods = {

        // Returns collection containing first element of node collection

        first: function(){
            var result = this[0];
            return result ? [result] : [];
        },


        // Returns collection containing last element of node collection

        last: function(){
            var result = this[ this.length - 1 ];
            return result ? [result] : [];
        },


        // Returns collection containing element with specified index of node collection

        eq: function(i){
            var result = this[i];
            return result ? [result] : [];
        },


        // Finds children of node (nodes)

        find: function(selector){

            var result = [];

            this.each(function(){
                result.push( Query(selector, this) );
            }, this);

            return result;
        },


        // Returns array containing inner HTML of collection elements or
        // sets HTML to elements of node collection if argument specified

        html: function(htmlString){

            var result = [],
                getHTML = function(){
                    result.push(this.innerHTML);
                },
                setHTML = function(){
                    this.innerHTML = htmlString;
                };

            this.each(htmlString ? setHTML : getHTML);

            return htmlString
                ? this
                : result.length === 1
                    ? result[0]
                    : result;
        },


        // Sets style defined as object
        // into style attribute

        css: function(options){

            var replace,
                setAlias,
                alias = {
                    size: 'width|height|top|left|right|bottom|marginTop|marginBottom|marginLeft|marginRight|paddingTop|paddingBottom|paddingLeft|paddingRight',
                    css3prop: 'mozBoxShadow|MozBoxShadow|webkitBoxShadow|WebkitBoxShadow|mozborderRadius|MozborderRadius|webkitBorderRadius|WebkitBorderRadius'
                };

            replace = {
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

            setAlias = function(names, setTo){
                for ( var i = 0, l = names.length; i < l; i++ ) {
                    replace[names[i]] = setTo;
                }
            };


            setAlias(alias.size.split('|'), replace.size);
            setAlias(alias.css3prop.split('|'), replace.css3prop);


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
        },

        each: Utils.each

    };









    (function(p){
        for ( var method in Methods ) {
            p[method] = Methods[method];
        }
    }(Array.prototype));







    if ( !window.console || !window.console.log ) {
        window.console = {
            log: function(){
                alert(arguments.join(' '));
            }
        };
    }




    

    var $2 = function(selector){

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


            //(/.*?((?:(?:-)?[0-9]+(?:px|%)?|left|right|top|bottom|center|inherit)).*?/ig, '$1 ')

            var replace = {
                
                    background: function(prop, val){

                        var re = {
                                image: /.*((?:url\(.*\)|(?:(?:-.+)?-)?.+-gradient\(.*\))).*/i,
                                position: /.*?((?:(?:-)?[0-9]+(?:px|%)?|left|right|top|bottom|center))\s+?((?:(?:-)?[0-9]+(?:px|%)?|left|right|top|bottom|center)).*/i,
                                repeat: /.*(no-repeat|repeat-x|repeat-y|[^-]repeat|round|space).*/i,
                                important: /!important/i
                            },
                            color,
                            image,
                            position,
                            repeat,
                            none = {
                                backgroundColor: 'transparent',
                                backgroundImage: 'none'
                            };

                        if ( Utils.trim(val) === 'none' ) return none;



//function zzz(str, p1, p2, offset, s) {
//
//    console.log('str:', str, '\np1:', p1, '\np2:', p2, '\noffset:',offset, '\ns:',s);
//    //return p1 + ", " + p2;
//}
//
//var newString = "my XXzz".replace(/(X+)(z+)/, zzz);






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



    window.$ = function(selector, parentNode){ return Query(selector, parentNode) };

    window.Query = Query; // temporary for debug
    window.Utils = Utils; // temporary for debug

}(document));
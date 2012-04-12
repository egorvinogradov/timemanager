(function(d){

    var $,
        Settings,
        Utils,
        Query,
        Methods;



    // Need to run first

    var _ua = navigator.userAgent;




    Settings = {

        // Contains information about browsers and vendor prefixes

        browser: {
            msie: {
                test: /msie/i.test(_ua),
                prefix: 'Ms'
            },
            webkit: {
                test: /webkit/i.test(_ua),
                prefix: 'Webkit'
            },
            gecko: {
                test: /gecko/i.test(_ua),
                prefix: 'Moz'
            },
            opera: {
                test: /opera/i.test(_ua),
                prefix: 'O'
            }
        }

    };


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

            if ( nodes && (( nodes.length && nodes instanceof Object ) || nodes instanceof Node ) ) {

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

            var prefix;

            for ( var name in Settings.browser ) {
                if ( Settings.browser[name].test ) {

                    prefix = Settings.browser[name].prefix;
                    return d.body[prop]
                        ? prop
                        : prefix + this.capitalize(prop);
                }
            }

            return prop;
        }
    };



    // Returns node collection for specified selector
    // Examples:
    //    Query('body')
    //    Query(document.body)
    //    Query('.class')
    //    Query('#id')
    //    Query('.class, body, #id')
    //    Query('.class', container)

    Query = function(s, parentNode){

        var getBySelector,
            getFromNodes,
            isSelector = typeof s === 'string' || s instanceof String;


        getBySelector = function(s){

            var selectors = s.split(','),
                results = [],
                getNodes;


            getNodes = function(selector){

                var getByTagName,
                    getByClassName,
                    getById,
                    tagNameRe = /^\w+$/i,
                    classNameRe = /^\.[a-z0-9-_.]+$/i,
                    idRe = /^#[a-z0-9-_]+$/i,
                    result;

                parentNode = parentNode && parentNode instanceof Node
                    ? parentNode
                    : parentNode && parentNode.length && parentNode[0] instanceof Node
                        ? parentNode[0]
                        : d;

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

                    // TODO: make it crossbrowser

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
//                console.log('Node type:',
//                    tagNameRe.test(selector)    && 'TAG  ' + selector   ||
//                    classNameRe.test(selector)  && 'CLASS  ' + selector ||
//                    idRe.test(selector)         && 'ID  ' + selector
//                );


                result =
                    tagNameRe.test(selector)    && getByTagName(selector)   ||
                    classNameRe.test(selector)  && getByClassName(selector) ||
                    idRe.test(selector)         && getById(selector)        ||
                    [];

                return result;

            };


            for ( var i = 0, l = selectors.length; i < l; i++ ) {
                results = results.concat(getNodes(Utils.trim(selectors[i])));
            }

            return results;

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


        // Finds children of nodes

        find: function(selector){
            
            var result = [];

            this.each(function(){
                result = result.concat( Query(selector, this) );
            }, this);

            return result;
        },


        // Adds nodes to initial node array

        add: function(selector, parentNode){
            return this.concat( Query(selector, parentNode) );
        },


        // Returns array containing inner HTML of collection of elements or
        // sets HTML to elements if argument 'htmlString' specified

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

            var measurableProperties = 'width|height|top|left|right|bottom|marginTop|marginBottom|marginLeft|marginRight|paddingTop|paddingBottom|paddingLeft|paddingRight',
                setUnits = function(value){
                return +value
                    ? value + 'px'
                    : value;
            };

            this.each(this, function(){

                for ( var property in options ) {

                    var value = measurableProperties.indexOf(property) >= 0
                            ? setUnits(options[property])
                            : options[property];

                    this.style[property] = value;

                }
            });

            return this;
        },

        each: Utils.each,


        // Animation

        animate: function(options, time, callback){

            var animate = function(element){
                options[Utils.setVendorPrefix('transition')] = 'all ' + time + 'ms ease';
                options.position = 'relative';
                element.css(options);

                // remove transition when animation will be finished
            };

            this.each(function(){
                animate([this]);
            });

            return this;
        }

    };








    (function(p){
        for ( var method in Methods ) {
            p[method] = Methods[method];
        }
    }(Array.prototype));



    if ( !window.console || !window.console.log ) {
        window.console = {
            log: function(){
                alert(Array.prototype.join.call(arguments, ' '));
            }
        };
    }



    window.$ = function(selector, parentNode){ return Query(selector, parentNode) };

    window.Query = Query; // temporary for debug
    window.Utils = Utils; // temporary for debug

}(document));
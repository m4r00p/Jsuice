/**
 * Core namespace of Jsuice
 *
 * @param global {Object} Global object in working enviroment
 */
var Jsuice = function (global) {
    this.__global    = global;
};

/**
 * Inherits helper for Jsuice.
 *
 * @param c {Function} Child constructor function.
 * @param p {Function} Parent constructor function.
 *
 * return {Function} Child constructor.
 */
Jsuice.inherits = function (c, p) {
    c.prototype = Object.create(p.prototype);
    c.prototype.constructor = c;
    c.prototype.uper = p;

    return c;
};

Jsuice.prototype = {
    /**
     * @private __global
     */
    __global: null,

    /**
     * Parses given constructor function.
     * Takes only text between (). And look for special pattern. (@Inject)
     *
     * @private
     * @param constructor {Function} Constructor function.
     * @return {Array} Name string array.
     */
    __parseDependecyString: function (constructor) {

        var string, regexp, match, names = [];

        string = constructor.toString();
        regexp = /(\/\*+\s*@Inject\s*)(.*)(\s*\*\/)/m;
        match  = string.match(regexp); // looks for something like this: /* @Inject Dependent1, Dependent2 */

        if (match && match[2]) {
            names = match[2].replace(/^\s+/, '').replace(/\s+$/, ''); //trim
            names = names.split(/[, ]+/); // convert to array spliting by "," or " " or both

            // return empty array in case of not well formed string
            if (names.length === 1 && names[0] === "") {
                names = [];
            }
        }

        return names;
    },

    /**
     * Create instance object of given name.
     *
     * @private
     * @param name {String} Object constructor name.
     * @return {Object} Created object.
     */
    __createDependencyInstance: function (name) {
        var key,
            global    = this.__global,
            namespace = global,
            map       = name.split(".");

        while (key = map.shift()) {
            namespace = namespace[key];
        }

        return this.getInstance(namespace);
    },

    /**
     * Resolves from modules
     *
     * @param match
     */
    __resolveFromModules: function (match) {
        var i, len, replacement,
            modules = this.__modules;

        for (i = 0, len = modules.length; i < len; i++) {
           replacement = modules[i].boundTo(match);
        }

        if (!replacement) {
           replacement = match;
        }

        return replacement;
    },
    /**
     * Analyzes dependencies of given class constructor function.
     *
     * @private
     * @param klass {Function} Constructor function for given class
     * @return {Array} Array contains needed objects
     */
    __resolveDependencies: function (klass) {
        var dependency, i, len,
            dependencies = [],
            match        = this.__parseDependecyString(klass);

        if (match.length) {

            for (i = 0, len = match.length; i < len; i++) {

                dependency = this.__createDependencyInstance(
                    this.__resolveFromModules(match[i]));

                if (dependency) {
                    dependencies.push(dependency);
                }
                else {
                    throw new Error("Can't resolve dependency!");
                }
            }
        }

        return dependencies;
    },

    /**
     ------------------------------------------------------------
     PUBLIC API
     ------------------------------------------------------------
     */
    /**
     * Create and configure injector with given modules.
     *
     * @public
     * @param modules {Jsuice.Module} As arguments there could be more that one module to configure Injector separeted by coma.
     * @return {Jsuice.Injector} Configured Injector
     */
    getInjector: function (/* ...modules... */) {
        this.__modules = Array.prototype.slice.apply(arguments);

        return this;
    },

    /**
     * Create instance of klass with solved dependenties
     *
     * @param klass {Function} Constructor of object
     * @return {Object} Baked object.
     */
    getInstance: function (klass) {
        var dependencies = this.__resolveDependencies(klass);

        // black magic
        return new (Function.prototype.bind.apply(
            klass,
            [null].concat(dependencies)
        ));
    }
};

/**
 * @constructor
 */
Jsuice.Bind = function (klass) {
    this.__klass = klass;
};

Jsuice.Bind.prototype = {
    __klass: null,
    __to: null,
    __scope: null,

    to: function (klass) {
        this.__to = klass;

        return this;
    },

    boundTo: function () {
        return this.__to;
    }
};

/**
 * @constructor
 */
Jsuice.Module = function () {
    this.__bindMap = {};

    this.configure();
};

Jsuice.Module.prototype = {
    /**
     * key-value map:
     *   key -> dependency name
     *   value -> Jsuice.Bind object
     */
    __bindMap: null,

    /**
     * This method should be overridden.
     * And is use to define bindings.
     */
    configure: function () {
        throw new Error("Configure function should be overriden!!!");
    },

    /**
     * Binds class interface with class.
     *
     * @param klass {String)
     * @return {Jsuice.Bind}
     */
    bind: function (klass) {
        var bind;

        if (Object.keys(this.__bindMap).indexOf(klass) !== -1) {
            throw new Error("Given binding already exists!!!")
        }

        return (this.__bindMap[klass] = new Jsuice.Bind(klass));
    },

    /**
     * Returns bounded object name.
     *
     * @param klass
     * @return {String}
     */
    boundTo: function (klass) {
        var bound = this.__bindMap[klass];

        if (bound === undefined) {
            console.warn("Given binding not exists!!!");

            return null;
        }

        return bound.boundTo();
    }
};


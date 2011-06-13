var Jsuice = function (global) {

    this.__global    = global;
};

Jsuice.prototype = {

    __global: null,

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
     * Analize dependencies of given class contructor function.
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
                dependency = this.__createDependencyInstance(match[i]);

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
        return this;
    },

    /**
     * Create instance of klass with solved dependenties
     *
     * @param klass {Function} Constructor of object
     * @return {Object} Baked object
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

Jsuice.Bind = function () {

};

Jsuice.Bind.prototype = {
    to: function (klass) {

    }
};

Jsuice.Module = function () {

};

Jsuice.Module.prototype = {

    configure: function () {

    },

    bind: function (klass) {

    }
};


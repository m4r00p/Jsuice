/**
 * Jusuice :)
 *
 * @param global {Object} Global object in working enviroment
 * @constructor
 */
var Jsuice = function (global) {
  this.__global    = global;
};

/**
 * Helper for inheritance.
 *
 * @param {function} c Child constructor function.
 * @param {function} p Parent constructor function.
 *
 * @return {function} Child constructor.
 */
Jsuice.inherits = function (c, p) {
  c.prototype = Object.create(p.prototype);
  c.prototype.constructor = c;

  c.prototype.uper = p;

  return c;
};

Jsuice.prototype = {
  /**
   * @type {Object}
   * @private __global
   */
  __global: null,

  /**
   * Parses given constructor function.
   * Takes only text between (). And look for special pattern. ('@Inject' to be exect)
   *
   * @param  {function} constructor Constructor function.
   * @return {Array.<string>} Array of dependency names.
   * @private
   */
  __parseDependecyString: function (constructor) {
    var string, regexp, match, names = [];

    string = constructor.toString();
    regexp = /(\/\*+\s*@Inject\s*)(.*)(\s*\*\/)/m;
    match  = string.match(regexp); // matches text like this: /* @Inject Dependent1, Dependent2 */

    if (match && match[2]) {
      names = match[2].replace(/^\s+/, '').replace(/\s+$/, ''); // trim
      names = names.split(/[, ]+/); // converts result of trim to an array by spliting using "," or " " or both

      if (names.length === 1 && names[0] === "") {
        // assigns empty array in case of not well formed string or just no dependencies
        names = [];
      }
    }

    return names;
  },

  /**
   * Creates instance of object by given name. Also supports namespaces.
   *
   * @param {string} name Object constructor name.
   * @return {Object} Created object.
   * @private
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
   * Resolves dependency which should be bind to constructor/interface for given name argument.
   *
   * @param {string} name Name of dependency.
   * @return {string} Constructor name which was bind to dependencyName if none it returns name.
   * @private
   */
  __resolveFromModules: function (name) {
    var i, len, replacement,
    modules = this.__modules;

    for (i = 0, len = modules.length; i < len; i++) {
      replacement = modules[i].boundTo(name);
    }

    if (!replacement) {
      replacement = name;
    }

    return replacement;
  },

  /**
   * Analyzes dependencies for given class constructor function.
   *
   * @param {function} klass Constructor function for given class.
   * @return {Array} Array contains needed constructor function names.
   * @private
   */
  __resolveDependencies: function (klass) {
    var dependency, i, len,
    dependencies = [],
    match        = this.__parseDependecyString(klass);

    if (match.length) {

      for (i = 0, len = match.length; i < len; i++) {

        dependency = this.__createDependencyInstance(this.__resolveFromModules(match[i]));

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
   * Create and configure injector with given modules.
   *
   * @param modules {Jsuice.Module} As arguments there could be more that one module to configure Injector separeted by coma.
   * @return {Jsuice.Injector} Configured Injector
   */
  getInjector: function (/* ...modules... */) {
    var modules = Array.prototype.slice.apply(arguments);
    this.__modules = [];

    for (var i = 0, len = modules.length; i < len; ++i) {
        this.__modules.push(new modules[i](global)); 
    }

    return this;
  },

  /**
   * Create instance of klass with solved dependenties
   *
   * @param {function} klass Constructor of object
   * @return {Object} Baked object.
   */
  getInstance: function (klass) {
    var dependencies = this.__resolveDependencies(klass);

    return new (Function.prototype.bind.apply(klass,
      [null].concat(dependencies)));
  }
};

/**
 * @constructor
 */
Jsuice.Bind = function (klass, global) {
  this.__klass = klass;
  this.__global = global;
};

Jsuice.Bind.prototype = {

  __global: null,
  __klass: null,
  __to: null,
  __scope: null,


  to: function (klass) {

    //FIXME: implement secure binding object which exists
    console.log('Bind.to', klass);
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
Jsuice.Module = function (global) {
  this.__bindMap = {};
  this.__global =  global;

  this.configure();
};

Jsuice.Module.prototype = {
  __global: null,
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
   * @param {string) klass
   * @return {Jsuice.Bind}
   */
  bind: function (klass) {
    var bind;

    //FIXME: implement secure binding object which exists
    //var key,
    //global    = this.__global,
    //namespace = global,
    //map       = klass.split(".");

    //console.log(map)

    //while (key = map.shift()) {
      //namespace = namespace[key];
    //}

    //console.log('Module.bind', klass, namespace);


    if (Object.keys(this.__bindMap).indexOf(klass) !== -1) {
      throw new Error("Given binding already exists!!!")
    }

    return this.__bindMap[klass] = new Jsuice.Bind(klass, global);
  },

  /**
   * Returns bounded object name.
   *
   * @param {string} klass
   * @return {string} Bounded name of constructor
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


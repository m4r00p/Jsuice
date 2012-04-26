/**
 * Plain constructor hierarchy
 */
var DependencyA = function () {};
DependencyA.prototype = {
    evaluate: function () {
        return 1;
    }
};

var DependencyB = function (/* @Inject DependencyC */ c) {
    this.__c = c;
};
DependencyB.prototype = {
    __c: null,

    evaluate: function () {
        return 1 + this.__c.evaluate();
    }
};

var DependencyC = function () {};
DependencyC.prototype = {

    evaluate: function () {
        return 1;
    }
};

var ParentClass = function (/* @Inject DependencyA, DependencyB */ a, b) {
    this.__a = a;
    this.__b = b;
};

ParentClass.prototype = {

    __a: null,
    __b: null,

    evaluate: function () {
        return this.__a.evaluate() + this.__b.evaluate();
    }
};

/**
 * Namespaced constructor hierarchy
 */
var app = {};
app.ParentClass = function (/* @Inject app.DependencyA, app.DependencyB */ a, b) {
    this.__a = a;
    this.__b = b;
};
app.ParentClass.prototype = {

    __a: null,
    __b: null,

    evaluate: function () {
        return this.__a.evaluate() + this.__b.evaluate();
    }
};

/**
 * Some interface
 * @interface
 */
app.DependencyA = function () {};
app.DependencyA.prototype = {
    evaluate: function () {
        return 1;
    }
};

app.DependencyB = function (/* @Inject app.b.DependencyC */ c) {

    this.__c = c;
};
app.DependencyB.prototype = {
    __c: null,

    evaluate: function () {
        return 1 + this.__c.evaluate(); //2
    }
};

app.b = {};

app.b.DependencyC = function () {};
app.b.DependencyC.prototype = {

    evaluate: function () {
        return 1;
    }
};

/**
 * @implements
 */
app.DependencyAImpl = function () {};
app.DependencyAImpl.prototype = {
    evaluate: function () {
        return 4;
    }
};

/**
 * Env-independent resolution global object
 */
var global = (function () {
    return global || this;
}());

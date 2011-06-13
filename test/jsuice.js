TestCase("JsuiceTestCase", {

    test__parseDependecyString: function() {

        var jsuice   = new Jsuice().getInjector(),
        constructor1 = function (/* @Inject Dep1, Dep2 */) {},
        constructor2 = function (/** @Inject Dep1, Dep2 */) {},
        constructor3 = function (/** @Inject Dep1,  Dep2 */) {},
        constructor4 = function (/** Inject Dep1,   Dep2 */) {},
        constructorLast = function () {};

        assertEquals(["Dep1", "Dep2"], jsuice.__parseDependecyString(constructor1));
        assertEquals(["Dep1", "Dep2"], jsuice.__parseDependecyString(constructor2));
        assertEquals(["Dep1", "Dep2"], jsuice.__parseDependecyString(constructor3));
        assertEquals([], jsuice.__parseDependecyString(constructor4));
        assertEquals([], jsuice.__parseDependecyString(constructorLast));

    },

    testPlainDependenties: function () {
      var klass = new Jsuice(global).getInjector().getInstance(ParentClass);

      assertSame(3, klass.evaluate());
    },

    testNamespaceDependenties: function () {
        var klass = new Jsuice(global).getInjector().getInstance(app.ParentClass);

        assertSame(3, klass.eveluate());
    }
});
define(
    ['chai', './test-wrapper.js' ,'../classes/object.js'],
    function(chai, testWrapper, MyObject) {
        var expect = chai.expect;
        var mainName = 'classes-object-test';

        testWrapper.execTest(
            mainName,
            'should have a working static method',
            function() {
                expect(MyObject.myStaticMethod(1, 3)).to.equal(1 + 3);
            }
        );

        testWrapper.execTest(
            mainName,
            'should have a working public method',
            function() {
                var myObject = new MyObject(1);
                expect(myObject.myPublicMethod(2)).to.equal(2 * (1 + 2));
            }
        );

                testWrapper.execTest(
            mainName,
            'should be failing',
            function() {
                expect(MyObject.myStaticMethod(1, 3)).to.equal(1);
            }
        );
    }
);

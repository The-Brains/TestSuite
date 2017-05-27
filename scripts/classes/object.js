define([], function() {
        var MyObject = function(input) {
            var inputInfo = input;

            this.myPublicMethod = function(n) {
                return n * inputInfo;
            }

            var myPrivateMethod = function() {
                inputInfo = inputInfo + 2;
            }

            myPrivateMethod();
        };

        MyObject.myStaticMethod = function(a, b) {
            return a + b;
        }

        return MyObject;
    },
)

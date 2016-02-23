'use strict';

angular.module('myApp')
    .controller('SigninCtrl', ['$scope', 'RhAuth', '$state', '$http', 'Rh',
    function ($scope, RhAuth, $state, $http, Rh) {

        if (RhAuth.isAuthenticated()) {
            $state.go("app.authenticated");
            return;
        }


        $scope.signin = function () {

            var promise = RhAuth.signin($scope.user.email, $scope.user.password);

            promise.then(function (response) {
                if (response) {
                    console.log("Authenticated");
                    $state.go('app.authenticated', {});
                    // Simple GET request example:
                    Rh.all('').getList()
                        .then(function (dbs) {
                            console.log(dbs);
                            // returns a list of databases
                        })
                }
                else {
                    console.log("Not Authenticated");
                }
            })


        }
    }]);
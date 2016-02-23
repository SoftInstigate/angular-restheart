'use strict';

angular.module('myApp')
    .controller('SigninCtrl', ['$scope', 'RhAuth', '$state', '$http', 'Rh', 'localStorageService',
        function ($scope, RhAuth, $state, $http, Rh, localStorageService) {


            if (RhAuth.isAuthenticated()) {
                $state.go("app.authenticated");
                return;
            }


            $scope.signin = function () {

                var promise = RhAuth.signin($scope.user.email, $scope.user.password);

                promise.then(function (response) {

                    //Example of using the browser local storage to catch the 401 Error.
                    var error401 = localStorageService.get('Error 401');
                    if (error401) $scope.error401Why = error401.why;


                    if (response) {
                        console.log("Authenticated");
                        $state.go('app.authenticated', {});

                    }
                    else {
                        console.log("Not Authenticated");
                    }
                })


            }
        }]);
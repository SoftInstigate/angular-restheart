'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ui.router',
    'restheart'
])


    .config(function (restheartProvider) {

        restheartProvider.setBaseUrl("http://localhost:8080/");
        restheartProvider.setLogicBaseUrl("http://localhost:8080/_logic");

        restheartProvider.onForbidden(
            function () {
                alert("Forbidden - User Custom Function");
            }
        );
        restheartProvider.onTokenExpired(
            function () {
                alert("Token Expired - User Custom Function");
            }
        );
        restheartProvider.onUnauthenticated(
            function () {
                alert("User Unauthenticated, wrong username or password - User Custom Function");
            }
        );


    })

    .config(['$compileProvider',
        function ($compileProvider) {
            // configure new 'compile' directive by passing a directive
            // factory function. The factory function injects the '$compile'
            $compileProvider.directive('compile', function ($compile) {
                // directive factory creates a link function
                return function (scope, element, attrs) {
                    scope.$watch(
                        function (scope) {
                            // watch the 'compile' expression for changes
                            return scope.$eval(attrs.compile);
                        },
                        function (value) {
                            // when the 'compile' expression changes
                            // assign it into the current DOM
                            element.html(value);
                            // compile the new DOM and link it to the current
                            // scope.
                            // NOTE: we only compile .childNodes so that
                            // we don't get into infinite loop compiling ourselves
                            $compile(element.contents())(scope);
                        }
                    );
                };
            });
        }])


    /* Controllers */

    .controller('MainCtrl', ['$state', 'RhAuth', function ($state, RhAuth) {
        // redirect to signin if not authenticated
        if (!RhAuth.isAuthenticated()) {
            $state.go("signin");
            return;
        }
    }])


    .controller('SigninCtrl', ['$scope', 'RhAuth', '$state', '$http', '$location', 'Rh',
        function ($scope, RhAuth, $state, $http, $location, Rh) {

            if (RhAuth.isAuthenticated()) {
                $state.go("app.authorized");
                return;
            }


            $scope.signin = function () {

                var promise = RhAuth.signin($scope.user.email, $scope.user.password);

                promise.then(function (response) {
                    if (response) {
                        console.log("Authorized");
                        $state.go('app.authorized', {});
                        // Simple GET request example:
                        Rh.all('').getList()
                            .then(function (dbs) {
                                console.log(dbs);
                                // returns a list of databases
                            })
                    }
                    else {
                        console.log("Not Authorized");
                    }
                })


            }
        }])

    .controller('LoggedCtrl', ['RhAuth', '$state', '$scope',
        function (RhAuth, $state, $scope) {
            $scope.signout = function () {
                var promise = RhAuth.signout(true);
                promise.then(function () {
                    $state.go('signin', {});
                });

            }
        }])


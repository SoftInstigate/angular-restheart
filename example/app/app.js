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
                console.log("Forbidden - User Function");
            }
        );
        restheartProvider.onTokenExpired(
            function () {
                console.log("Token Expired - User Function");
            }
        );
        restheartProvider.onUnauthenticated(
            function () {
                console.log("User Unauthenticated, wrong username or password - User Function");
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

    .run(['$rootScope', '$state', 'RhAuth',
        function ($rootScope, $state, RhAuth) {
            RhAuth.clearAuthInfo();
        }])

    /* Controllers */

    .controller('SigninCtrl', ['$scope', 'RhAuth', '$state', '$http', '$location', 'Rh',
        function ($scope, RhAuth, $state, $http, $location, Rh) {

            $scope.signin = function () {

                var promise = RhAuth.signin($scope.user.email, $scope.user.password);
                promise.then(function (response) {
                    if (!response) {
                        //$state.go('401', {});
                    }
                    else if (RhAuth.isAuthenticated()) {
                        $state.go('authorized', {});
                        // Simple GET request example:
                        Rh.all('').getList()  // GET: /users
                            .then(function (users) {
                                console.log(users);
                                // returns a list of users
                                // first Restangular obj in list: { id: 123 }
                            })
                    }
                })
            }
        }])

    .controller('LoggedCtrl', ['$scope', '$window', '$location', 'RhAuth', '$state',
        function ($scope, $window, $location, RhAuth, $state) {
            $scope.signout = function () {
                RhAuth.signout(true);
                $state.go('home', {});
            }
        }])

    .controller('403Ctrl', [function () {
        console.log("403");
    }])

    .controller('401Ctrl', [function () {
        console.log("Error 401 Page");
    }])

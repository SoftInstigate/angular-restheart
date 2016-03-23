'use strict';

angular.module('myApp', [
    'ui.router',
    'restheart',
    'LocalStorageModule'
])


    .config(function (restheartProvider) {

        restheartProvider.setBaseUrl("http://localhost:8080");
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

        restheartProvider.onNetworkError(
            function () {
                alert("Network error, the server is unreachable. It may be due to network problems or the server is offline - User Custom Function");
                sessionStorage.removeItem("rh.rh_authtoken");
                window.location.href = '../app/#/signin';
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
        }]);





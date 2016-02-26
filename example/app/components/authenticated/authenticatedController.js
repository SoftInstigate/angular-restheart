'use strict';

angular.module('myApp')
    .controller('AuthenticatedCtrl', ['RhAuth', '$state', '$scope', 'localStorageService', 'Rh',
        function (RhAuth, $state, $scope, localStorageService, Rh) {


            $scope.query = function () {
                Rh.all('/').getList().then(function (dbs) {
                    console.log(dbs);
                    $scope.queryResult = dbs.plain();
                    // returns a list of databases

                })

            }


            $scope.signout = function () {
                var promise = RhAuth.signout(true);
                promise.then(function () {
                    $state.go('signin', {});
                });

            }
        }])
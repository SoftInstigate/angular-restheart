'use strict';

angular.module('myApp')
    .controller('AuthenticatedCtrl', ['RhAuth', '$state', '$scope',
    function (RhAuth, $state, $scope) {
        $scope.signout = function () {
            var promise = RhAuth.signout(true);
            promise.then(function () {
                $state.go('signin', {});
            });

        }
    }])
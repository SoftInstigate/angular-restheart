'use strict';

angular.module('myApp')
    .controller('MainCtrl', ['$state', 'RhAuth', function ($state, RhAuth) {
        // redirect to signin if not authenticated
        if (!RhAuth.isAuthenticated()) {
            $state.go("signin");
            return;
        }
    }])
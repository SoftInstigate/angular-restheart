/* global angular */

'use strict';
/**
 * Config for the router
 */
angular.module('myApp')
    .run(['$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }])

    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider,$urlRouterProvider) {
            $urlRouterProvider
                .otherwise('/signin');
            $stateProvider

                .state('signin', {
                    url: '/signin',
                    templateUrl: 'components/signin/signinView.html',
                    controller: 'SigninCtrl'
                })

                .state('app', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    controller: 'MainCtrl'
                })

                .state('app.authenticated', {
                    url: "/authenticated",
                    templateUrl: 'components/authenticated/authenticatedView.html',
                    controller: 'AuthenticatedCtrl',
                    resolve: {
                        baseUrl: function (localStorageService) {
                            return localStorageService.get('restheartUrl');

                        }
                    }
                }

            );
        }
    ]);

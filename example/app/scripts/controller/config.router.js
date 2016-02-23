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
                .otherwise('/authorized');
            $stateProvider

                .state('signin', {
                    url: '/signin',
                    templateUrl: 'views/signin.html',
                    controller: 'SigninCtrl'
                })

                .state('app', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    controller: 'MainCtrl'
                })

                .state('app.authorized', {
                    url: "/authorized",
                    templateUrl: 'views/base.html',
                    controller: 'LoggedCtrl',
                    resolve: {
                        baseUrl: function (localStorageService) {
                            return localStorageService.get('restheartUrl');

                        }
                    }
                }

            );
        }
    ]);

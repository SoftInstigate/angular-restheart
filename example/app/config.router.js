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
                    templateUrl: 'tpl/signin.html',
                    controller: 'SigninCtrl'
                })

                .state('403', {
                    url: '/403',
                    templateUrl: 'tpl/page_403.html',
                    controller: '403Ctrl'
                })

                .state('401', {
                    url: '/401',
                    templateUrl: 'tpl/page_401.html',
                    controller: '401Ctrl'
                })

                .state('app', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    controller: 'MainCtrl'
                })

                .state('app.authorized', {
                    url: "/authorized",
                    templateUrl: 'tpl/base.html',
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

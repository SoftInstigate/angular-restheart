(function () {
    'use strict';

    angular
            .module('restheart')
            .factory('Rh', Rh);

    Rh.$inject = ['Restangular', 'localStorageService', '$location', '$state', '$stateParams', 'restheart', '$http'];

    // Restangular service for API calling
    // also handles auth token expiration

    function Rh(Restangular, localStorageService, $location, $state, $stateParams, restheart, $http) {
        this.clearAuthInfo = function () {
            localStorageService.remove("rh_userid");
            localStorageService.remove("rh_authtoken");
            localStorageService.remove("rh_nav");

            if (!angular.isUndefined($http) && !angular.isUndefined($http.defaults)) {
                delete $http.defaults.headers.common["Authorization"];
            }
        };

        var that = this;

        return Restangular.withConfig(function (RestangularConfigurer) {

            var baseUrl = restheart.baseUrl;

            if (angular.isDefined(baseUrl) && baseUrl !== null) {
                RestangularConfigurer.setBaseUrl(baseUrl);
            } else { //default configuration
                var _restheartUrl;
                _restheartUrl = "http://" + $location.host() + ":8080";
                RestangularConfigurer.setBaseUrl(_restheartUrl);
            }

            RestangularConfigurer.setErrorInterceptor(function (response, deferred, responseHandler) {
                // check if session expired
                var te = handleTokenExpiration(response);
                var f = handleForbidden(response);
                return !(te || f); // if handled --> false
            });

            RestangularConfigurer.setRequestInterceptor(function (elem, operation) {
                setAuthHeaderFromLS();
                return elem;
            });

            function setAuthHeaderFromLS() {
                var token = localStorageService.get('rh_authtoken');
                if (angular.isDefined(token) && token !== null) {
                    $http.defaults.headers.common["Authorization"] = 'Basic ' + localStorageService.get('rh_authtoken');
                }
            }

            function handleTokenExpiration(response) {
                var token = localStorageService.get('rh_authtoken');
                if (response.status === 401 && angular.isDefined(token) && token !== null) {
                    that.clearAuthInfo();

                    localStorageService.set('rh_autherror', {
                        "why": "expired",
                        "path": $location.path(),
                        "state": $state.current.name,
                        "params": $stateParams
                    });

                    // call configured call back, if any
                    if (angular.isFunction(restheart.onTokenExpired)) {
                        restheart.onTokenExpired($location, $state);
                    }
                    return true; // handled
                }
                return false; // not handled
            }

            function handleForbidden(response) {
                if (response.status === 403) {
                    var token = localStorageService.get('rh_authtoken');
                    if (angular.isDefined(token) && token !== null) {
                        localStorageService.set('rh_autherror', {
                            'why': 'forbidden',
                            "path": $location.path(),
                            "state": $state.current.name,
                            "params": $stateParams
                        });

                        // call configured call back, if any
                        if (angular.isFunction(restheart.onForbidden)) {
                            restheart.onForbidden($location, $state);
                        }
                    } else {
                        // call configured call back, if any
                        if (angular.isFunction(restheart.onUnauthenticated)) {
                            that.clearAuthInfo();

                            localStorageService.set('rh_autherror', {
                                'why': 'not_authenticated',
                                "path": $location.path(),
                                "state": $state.current.name,
                                "params": $stateParams
                            });

                            restheart.onUnauthenticated($location, $state);
                        }
                    }

                    return true; // handled
                }

                return false; // not handled
            }
        });
    }
})();
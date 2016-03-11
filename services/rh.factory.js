(function () {
    'use strict';

    angular
            .module('restheart')
            .factory('Rh', Rh);


    Rh.$inject = ['Restangular', 'localStorageService', '$location', '$state', 'restheart', '$http'];

    // Restangular service for API calling
    // also handles auth token expiration

    function Rh(Restangular, localStorageService, $location, $state, restheart, $http) {
        return Restangular.withConfig(function (RestangularConfigurer) {

            var baseUrl = restheart.baseUrl;

            if (angular.isDefined(baseUrl) && baseUrl !== null) {
                RestangularConfigurer.setBaseUrl(baseUrl);
            } else { //default configuration
                var _restheartUrl;
                _restheartUrl = "http://" + $location.host() + ":8080";
                localStorageService.set("restheartUrl", _restheartUrl);
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
                var token = localStorageService.get('authtoken');
                if (angular.isDefined(token) && token !== null) {
                    $http.defaults.headers.common["Authorization"] = 'Basic ' + localStorageService.get('authtoken');
                }
            }

            function handleTokenExpiration(response) {
                var token = localStorageService.get('authtoken');
                if (response.status === 401 && angular.isDefined(token) && token !== null) {
                    // call configure onTokenExpired

                    localStorageService.set('error', {
                        "why": "expired",
                        "from": $location.path()
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
                    var token = localStorageService.get('authtoken');
                    if (angular.isDefined(token) && token !== null) {
                        localStorageService.set('Error 403', {
                            'why': 'forbidden',
                            'from': $location.path()
                        });
                        
                        localStorageService.set('error', {
                            "why": "forbidden",
                            "from": $location.path()
                        });

                        // call configured call back, if any
                        if (angular.isFunction(restheart.onForbidden)) {
                            restheart.onForbidden($location, $state);
                        }
                    } else {
                        // call configured call back, if any
                        if (angular.isFunction(restheart.onUnauthenticated)) {
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
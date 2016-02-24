(function () {
    'use strict';

    angular
        .module('restheart')
        .factory('Rh', Rh);


    Rh.$inject = ['Restangular', 'localStorageService', '$location', 'restheart', '$http'];

    // Restangular service for API calling
    // also handles auth token expiration

    function Rh(Restangular, localStorageService, $location, restheart, $http) {
        return Restangular.withConfig(function (RestangularConfigurer) {

            var baseUrl = restheart.baseUrl;

            if (angular.isDefined(baseUrl) && baseUrl !== null) {
                RestangularConfigurer.setBaseUrl(baseUrl);
            }
            else { //default configuration
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
            };

            function handleTokenExpiration(response) {
                var token = localStorageService.get('authtoken');
                if (response.status === 401 && angular.isDefined(token) && token !== null) {
                    //if (response.status === 401 && RhAuth.isAuthenticated()) {
                    // UNAUTHORIZED but signed in => auth token expired
                    //RhAuth.clearAuthInfo();

                    localStorageService.set('Error 401', {
                        "why": "expired",
                        "from": $location.path(),
                        "params": routeParams
                    });
                    restheart.onTokenExpired();
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
                        restheart.onForbidden();

                    } else {
                        restheart.onUnauthenticated();
                    }

                    return true; // handled
                }

                return false; // not handled
            }
        });
    }
})();
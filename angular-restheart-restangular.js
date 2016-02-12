/**
 * Created by ricky on 2/10/16.
 */

var module = angular.module('restheartRestangular', []);

module.config(['localStorageServiceProvider', 'RestangularProvider',
    function (localStorageServiceProvider, RestangularProvider) {
        localStorageServiceProvider.setStorageType('sessionStorage');
        RestangularProvider.setRestangularFields({
            id: "_id",
            etag: "_etag",
            selfLink: "_links['self'].href"
            //parentResource: "_links['XXXX'].href" XXXX= rh:bucket | rh:coll
        });
        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
            var extractedData;
            if (operation === "getList") {
                if (angular.isDefined(data._embedded['rh:doc'])) {
                    extractedData = data._embedded['rh:doc'];
                } else if (angular.isDefined(data._embedded['rh:file'])) {
                    extractedData = data._embedded['rh:file'];
                } else {
                    extractedData = [];
                }

                if (angular.isDefined(data._embedded['rh:warnings'])) {
                    extractedData._warnings = data._embedded['rh:warnings'];
                }

                extractedData._returned = data._returned;
                extractedData._size = data._size;
                extractedData._total_pages = data._total_pages;
                extractedData._links = data._links;
            } else {
                extractedData = data;
            }

            //console.debug("**** " + JSON.stringify(extractedData, null, 2));

            return extractedData;
        });
        RestangularProvider.setDefaultHeaders({
            'Accept': 'application/hal+json',
            'Content-Type': 'application/json',
            'No-Auth-Challenge': 'true'
        });
    }])

// Restangular service for authentication
module.factory('AppLogicRestangular', ['Restangular', 'localStorageService', '$location',
    function (Restangular, localStorageService, $location) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setFullResponse(true);
            var baseUrl = localStorageService.get("restheartLogicUrl");
            if (angular.isDefined(baseUrl) && baseUrl !== null) {
                RestangularConfigurer.setBaseUrl(baseUrl);
            } else {
                //default configuration
                var _restheartUrl;
                _restheartUrl = "http://" + $location.host() + ":8080/_logic";
                RestangularConfigurer.setBaseUrl(_restheartUrl);

            }
        });
    }])

// Restangular service for API calling
// also handles auth token expiration
module.factory('ApiRestangular', ['Restangular', 'AuthService', '$state', '$stateParams', 'localStorageService', '$location',
    function (Restangular, AuthService, $state, $stateParams, localStorageService, $location) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            var baseUrl = localStorageService.get("restheartUrl");

            if (angular.isDefined(baseUrl) && baseUrl !== null) {
                RestangularConfigurer.setBaseUrl(baseUrl);
            } else {
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
                AuthService.setAuthHeaderFromLS();
                return elem;
            });

            function handleTokenExpiration(response) {
                if (response.status === 401 && AuthService.isAuthenticated()) {
                    // UNAUTHORIZED but signed in => auth token expired
                    AuthService.clearAuthInfo();
                    localStorageService.set('redirected', {
                        "why": "expired",
                        "from": $state.$current.toString(),
                        "params": $stateParams
                    });
                    return true; // handled
                }
                return false; // not handled
            }

            function handleForbidden(response) {
                if (response.status === 403) {
                    if (AuthService.isAuthenticated()) {
//                              console.debug("forbidden and signed in. redirecting to user page");
                        localStorageService.set('redirected', {
                            'why': 'forbidden',
                            'from': $state.$current.toString()
                        });

                    } else {
                             console.debug("forbidden and not logged in. redirecting to signin page");
                    }

                    return true; // handled
                }

                return false; // not handled
            }
        });
    }])

// Restangular service for API calling
// with full response (also returns response headers)
module.factory('ApiFRRestangular', ['ApiRestangular',
    function (ApiRestangular) {
        return ApiRestangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setFullResponse(true);
        });
    }])

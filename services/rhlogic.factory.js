(function () {
    'use strict';

    angular
        .module('restheart')
        .factory('RhLogic', RhLogic);


    RhLogic.$inject = ['Restangular', 'localStorageService', '$location', 'restheart'];


    function RhLogic(Restangular, localStorageService, $location, restheart) {
                return Restangular.withConfig(function (RestangularConfigurer) {
                    RestangularConfigurer.setFullResponse(true);

                    var baseUrl = restheart.logicBaseUrl;

                    if (angular.isDefined(baseUrl) && baseUrl !== null) {
                        RestangularConfigurer.setBaseUrl(baseUrl);
                    } else { //default configuration
                        var _restheartUrl;
                        _restheartUrl = "http://" + $location.host() + ":8080/_logic";
                        RestangularConfigurer.setBaseUrl(_restheartUrl);

                    }
                    RestangularConfigurer.setErrorInterceptor(function (response, deferred, responseHandler) {
                        // check if session expired
                        var f = handleUnauthenticated(response);
                        return f; // if handled --> false
                    });

                    function handleUnauthenticated(response) {
                        if (response.status === 401) {
                            localStorageService.set('Error 401', {
                                'why': 'wrong credentials',
                                'from': $location.path()
                            });
                            restheart.onUnauthenticated();
                            return true; // handled
                        }
                        //return true; // not handled
                    }
                });
            }
})();
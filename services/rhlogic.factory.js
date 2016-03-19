(function () {
    'use strict';

    angular
            .module('restheart')
            .factory('RhLogic', RhLogic);

    RhLogic.$inject = ['Restangular', 'localStorageService', '$location', '$state', '$stateParams', 'restheart'];

    function RhLogic(Restangular, localStorageService, $location, $state, $stateParams, restheart) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setFullResponse(true);

            var logicBaseUrl = restheart.getLogicBaseUrl();

            if (angular.isDefined(logicBaseUrl) && logicBaseUrl !== null) {
                localStorageService.set('rh_logicBaseUrl', logicBaseUrl);
                RestangularConfigurer.setBaseUrl(logicBaseUrl);
            } else if (angular.isDefined(localStorageService.get('rh_logicBaseUrl'))) {
                logicBaseUrl = localStorageService.get('rh_logicBaseUrl');
                RestangularConfigurer.setBaseUrl(logicBaseUrl);
            } else {
                throw "RhLogic ERROR: logicBaseUrl not found with localStorageService.get('rh_logicBaseUrl')";
            }

            RestangularConfigurer.setErrorInterceptor(function (response, deferred, responseHandler) {
                // check if session expired
                var f = handleUnauthenticated(response);
                return f; // if handled --> false
            });

            function handleUnauthenticated(response) {
                if (response.status === 401) {
                    localStorageService.set('rh_autherror', {
                        'why': 'not_authenticated',
                        "path": $location.path(),
                        "state": $state.current.name,
                        "params": $stateParams
                    });

                    restheart.onUnauthenticated();
                    return true; // handled
                }

                //return true; // not handled
            }
        });
    }
})();
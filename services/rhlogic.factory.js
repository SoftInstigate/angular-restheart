(function () {
    'use strict';

    angular
            .module('restheart')
            .factory('RhLogic', ['Restangular', 'localStorageService', '$location', '$state', '$stateParams', 'restheart', RhLogic]);

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
                var f = handleUnauthenticated(response);
                var ne = handleNetworkError(response);
            });

            function handleUnauthenticated(response) {
                if (response.status === 401) {
                    localStorageService.set('rh_autherror', {
                        'why': 'not_authenticated',
                        "path": $location.path(),
                        "state": $state.current.name,
                        "params": $stateParams
                    });
                    // call configured call back, if any
                    if (angular.isFunction(restheart.onUnauthenticated)) {
                        restheart.onUnauthenticated($location, $state);
                    }
                }
            }

            function handleNetworkError(response) {
                if (response.status === -1) {
                    localStorageService.set('rh_networkError', {
                        'why': 'network_error',
                        "path": $location.path(),
                        "state": $state.current.name,
                        "params": $stateParams
                    });
                    // call configured call back, if any
                    if (angular.isFunction(restheart.onNetworkError)) {
                        restheart.onNetworkError($location, $state);
                    }
                }
            }
        });
    }
})();
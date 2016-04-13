(function () {
    'use strict';

    angular
            .module('restheart')
            .config(['localStorageServiceProvider', 'RestangularProvider', configure]);

    function configure(localStorageServiceProvider, RestangularProvider) {
        localStorageServiceProvider.setPrefix('rh');
        localStorageServiceProvider.setStorageType('sessionStorage');

        RestangularProvider.setRestangularFields({
            id: "_id",
            etag: "_etag",
            selfLink: "_links['self'].href"
        });

        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
            var extractedData = [];
            if (operation === "getList") {

                if (angular.isDefined(data._embedded)) {

                    angular.forEach(data._embedded, function (value, key) {
                        if (key.lastIndexOf("rh:", 0) === 0 && key !== "rh:warnings")
                            extractedData = _.union(extractedData, value);
                    });

                    if (angular.isDefined(data._embedded)
                            && angular.isDefined(data._embedded['rh:warnings'])) {
                        extractedData._warnings = data._embedded['rh:warnings'];
                    }
                }

                for(var propertyName in data) {
                    extractedData[propertyName] = data[propertyName];
                }
            } else {
                extractedData = data;
            }

            return extractedData;
        });
        RestangularProvider.setDefaultHeaders({
            'Accept': 'application/hal+json',
            'Content-Type': 'application/json',
            'No-Auth-Challenge': 'true'
        });
    }
})();

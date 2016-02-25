(function () {
    'use strict';

    angular
        .module('restheart')
        .config(configure);

    configure.$inject = ['localStorageServiceProvider', 'RestangularProvider'];

    function configure(localStorageServiceProvider, RestangularProvider) {
        localStorageServiceProvider.setStorageType('sessionStorage');
        RestangularProvider.setRestangularFields({
            id: "_id",
            etag: "_etag",
            selfLink: "_links['self'].href"
        });
        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, deferred) {
            var extractedData;
            if (operation === "getList") {

                if (angular.isUndefined(data)
                    || angular.isUndefined(data._embedded)) {
                    extractedData = [];
                } else {

                    if (angular.isDefined(data._embedded['rh:doc'])) {
                        extractedData = data._embedded['rh:doc'];
                    } else if (angular.isDefined(data._embedded['rh:file'])) {
                        extractedData = data._embedded['rh:file'];
                    } else if (angular.isDefined(data._embedded['rh:bucket'])) {
                        extractedData = data._embedded['rh:bucket'];
                    } else if (angular.isDefined(data._embedded['rh:coll'])) {
                        extractedData = data._embedded['rh:coll'];
                    }else if (angular.isDefined(data. _embedded['rh:db'])) {
                        extractedData = data. _embedded['rh:db'];
                    }else {
                        extractedData = [];
                    }

                    if (angular.isDefined(data._embedded['rh:warnings'])) {
                        extractedData._warnings = data._embedded['rh:warnings'];
                    }
                }

                extractedData._returned = data._returned;
                extractedData._size = data._size;
                extractedData._total_pages = data._total_pages;
                extractedData._links = data._links;
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
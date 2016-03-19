(function () {
    'use strict';

    angular
            .module('restheart')
            .factory('FRh', ['Rh', FRh]);

    // Restangular service for API calling
    // with full response (also returns response headers)

    function FRh(Rh) {
        return Rh.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setFullResponse(true);
        });
    }
})();
(function () {
    'use strict';

    angular
            .module('restheart')
            .factory('FRh', FRh);

    FRh.$inject = ['Rh'];

    // Restangular service for API calling
    // with full response (also returns response headers)

    function FRh(Rh) {
        return Rh.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setFullResponse(true);
        });
    }
})();
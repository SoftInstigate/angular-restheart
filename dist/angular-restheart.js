(function () {
    'use strict';

    angular.module('restheart', [
        'LocalStorageModule',
        'base64',
        'restangular',
        'ui.router'
    ]).provider('restheart', restheart);

    function restheart() {

        this.setBaseUrl = function (f) {
            this._baseUrl = f;
        };

        this.setLogicBaseUrl = function (f) {
            this._logicBaseUrl = f;
        };
        
        this.getBaseUrl = function() {
            return this._baseUrl;
        };
        
        this.getLogicBaseUrl = function() {
            return this._logicBaseUrl;
        };

        this.onForbidden = function (f) {
            this.onForbidden = f;
        };

        this.onTokenExpired = function (f) {
            this.onTokenExpired = f;
        };

        this.onUnauthenticated = function (f) {
            this.onUnauthenticated = f;
        };

        this.onNetworkError = function (f) {
            this.onNetworkError = f;
        };

        this.$get = function () {
            return this;
        };
    };
    
})();
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

                    extractedData._returned = data._returned;
                    extractedData._size = data._size;
                    extractedData._total_pages = data._total_pages;
                    extractedData._links = data._links;
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
(function () {
    'use strict';

    angular
            .module('restheart')
            .factory('Rh', ['Restangular', 'localStorageService', '$location', '$state', '$stateParams', 'restheart', '$http', Rh]);

    // Restangular service for API calling
    // also handles auth token expiration

    function Rh(Restangular, localStorageService, $location, $state, $stateParams, restheart, $http) {
        this.clearAuthInfo = function () {
            localStorageService.remove("rh_userid");
            localStorageService.remove("rh_authtoken");
            localStorageService.remove("rh_nav");

            if (!angular.isUndefined($http) && !angular.isUndefined($http.defaults)) {
                delete $http.defaults.headers.common["Authorization"];
            }
        };

        var that = this;

        return Restangular.withConfig(function (RestangularConfigurer) {

            var baseUrl = restheart.getBaseUrl();

            if (angular.isDefined(baseUrl) && baseUrl !== null) {
                localStorageService.set('rh_baseUrl', baseUrl);
                RestangularConfigurer.setBaseUrl(baseUrl);
            } else if (angular.isDefined(localStorageService.get('rh_baseUrl'))) {
                baseUrl = localStorageService.get('rh_baseUrl');
                RestangularConfigurer.setBaseUrl(baseUrl);
            } else {
                throw "Rh ERROR: baseUrl not found with localStorageService.get('rh_baseUrl')";
            }

            RestangularConfigurer.setErrorInterceptor(function (response, deferred, responseHandler) {
                // check if session expired
                var te = handleTokenExpiration(response);
                var f = handleForbidden(response);
                var ne = handleNetworkError(response);
                return !(te || f || ne); // if handled --> false
            });

            RestangularConfigurer.setRequestInterceptor(function (elem, operation) {
                setAuthHeaderFromLS();
                return elem;
            });

            function setAuthHeaderFromLS() {
                var token = localStorageService.get('rh_authtoken');
                if (angular.isDefined(token) && token !== null) {
                    $http.defaults.headers.common["Authorization"] = 'Basic ' + localStorageService.get('rh_authtoken');
                }
            }

            function handleTokenExpiration(response) {
                var token = localStorageService.get('rh_authtoken');
                if (response.status === 401 && angular.isDefined(token) && token !== null) {
                    that.clearAuthInfo();

                    localStorageService.set('rh_autherror', {
                        "why": "expired",
                        "path": $location.path(),
                        "state": $state.current.name,
                        "params": $stateParams
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
                    var token = localStorageService.get('rh_authtoken');
                    if (angular.isDefined(token) && token !== null) {
                        localStorageService.set('rh_autherror', {
                            'why': 'forbidden',
                            "path": $location.path(),
                            "state": $state.current.name,
                            "params": $stateParams
                        });

                        // call configured call back, if any
                        if (angular.isFunction(restheart.onForbidden)) {
                            restheart.onForbidden($location, $state);
                        }
                    } else {
                        // call configured call back, if any
                        if (angular.isFunction(restheart.onUnauthenticated)) {
                            that.clearAuthInfo();

                            localStorageService.set('rh_autherror', {
                                'why': 'not_authenticated',
                                "path": $location.path(),
                                "state": $state.current.name,
                                "params": $stateParams
                            });

                            restheart.onUnauthenticated($location, $state);
                        }
                    }

                    return true; // handled
                }

                return false; // not handled
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
                    return true; // handled
                }

                //return true; // not handled
            }
        });
    }
})();
(function () {
    'use strict';

    angular
            .module('restheart')
            .service('RhAuth', ['$base64', '$http', 'localStorageService', 'RhLogic', '$q', 'Rh', 'restheart', RhAuth]);

    function RhAuth($base64, $http, localStorageService, RhLogic, $q, Rh, restheart) {

        this.getBaseUrl = function () {
            return restheart.getBaseUrl();
        };

        this.getLogicBaseUrl = function () {
            return restheart.getLogicBaseUrl();
        };

        this.setAuthHeader = function (userid, password) {
            $http.defaults.headers.common["Authorization"] = 'Basic ' + $base64.encode(userid + ":" + password);
        };

        this.saveAuthInfo = function (userid, password, roles) {
            var header = $base64.encode(userid + ":" + password);
            localStorageService.set('rh_userid', userid);
            localStorageService.set('rh_authtoken', header);
            localStorageService.set('rh_nav', $base64.encode(JSON.stringify(roles)));
            return header;
        };

        this.clearAuthInfo = function () {
            localStorageService.remove("rh_userid");
            localStorageService.remove("rh_authtoken");
            localStorageService.remove("rh_nav");

            if (!angular.isUndefined($http) && !angular.isUndefined($http.defaults)) {
                delete $http.defaults.headers.common["Authorization"];
            }
        };

        this.getAuthHeader = function () {
            return localStorageService.get('rh_authtoken');
        };

        this.getUserid = function () {
            return localStorageService.get('rh_userid');
        };

        this.getUserRoles = function () {
            var _nav = localStorageService.get('rh_nav');
            if (angular.isString(_nav)) {
                return JSON.parse($base64.decode(_nav));
            } else {
                return undefined;
            }
        };

        this.isAuthenticated = function () {
            var authHeader = this.getAuthHeader(localStorageService);
            return !(angular.isUndefined(authHeader) || authHeader === null);
        };

        this.signin = function (id, password, errorCallback) {
            var that = this;
            return $q(function (resolve, reject) {
                that.clearAuthInfo();
                that.setAuthHeader(id, password);
                var apiOptions = {
                    nocache: new Date().getTime()
                };
                RhLogic.one('roles', id)
                        .get(apiOptions)
                        .then(function (userRoles) {
                            var authToken = userRoles.headers('Auth-Token');
                            if (authToken === null) {
                                that.clearAuthInfo();
                                resolve(false);
                                return;
                            }
                            that.saveAuthInfo(id, authToken, userRoles.data.roles);
                            that.setAuthHeader(id, authToken);
                            resolve(true);
                        },
                                function (response) {
                                    if (response.status === 401) {
                                        resolve(false);
                                    } else {
                                        reject(response);
                                    }

                                });
            });
        };

        this.signout = function (removeTokenFromDB) {
            var that = this;
            return $q(function (resolve, reject) {
                if (removeTokenFromDB) {
                    var userid = localStorageService.get('rh_userid');
                    Rh.one('_authtokens', userid).remove().then(function () {
                        that.clearAuthInfo();
                        resolve(true);
                    }, function errorCallback(response) {
                        reject(response);
                    });
                } else {
                    that.clearAuthInfo();
                    resolve(true);
                }
            });
        };
    }
})();
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
                var ne = handleNetworkError(response);
                return !(ne || f); // if handled --> false
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
                    return true; // handled
                }

                //return true; // not handled
            }
        });
    }
})();
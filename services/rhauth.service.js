(function () {
    'use strict';

    angular
            .module('restheart')
            .service('RhAuth', RhAuth);

    RhAuth.$inject = ['$base64', '$http', 'localStorageService', 'RhLogic', '$q', 'Rh'];

    function RhAuth($base64, $http, localStorageService, RhLogic, $q, Rh) {

        this.setBaseUrl = function (url) {
            Rh.setBaseUrl(url);
        };

        this.setLogicBaseUrl = function (url) {
            RhLogic.setBaseUrl(url);
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
            var error = localStorageService.get('rh_autherror');

            localStorageService.clearAll();

            // avoid redirected to be deleted
            if (angular.isDefined(error) && error !== null) {
                localStorageService.set('rh_autherror', error);
            }

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
            return JSON.parse($base64.decode(_nav));
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
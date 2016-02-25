(function () {
    'use strict';

    angular
        .module('restheart')
        .service('RhAuth', RhAuth);


    RhAuth.$inject = ['$base64', '$http', 'localStorageService', 'RhLogic', '$q', 'Rh'];


    function RhAuth($base64, $http, localStorageService, RhLogic, $q, Rh) {

        this.setAuthHeader = function (userid, password) {
            $http.defaults.headers.common["Authorization"] = 'Basic ' + $base64.encode(userid + ":" + password);
        };

        this.saveAuthInfo = function (userid, password, roles) {
            var header = $base64.encode(userid + ":" + password);
            localStorageService.set('userid', userid);
            localStorageService.set('authtoken', header);
            localStorageService.set('nav', $base64.encode(JSON.stringify(roles)));
            return header;
        };

        this.clearAuthInfo = function () {
            var restheartUrl = localStorageService.get('restheartUrl');
            var redirected = localStorageService.get('redirected');

            localStorageService.clearAll();

            // avoid restheartUrl to be deleted
            localStorageService.set('restheartUrl', restheartUrl);

            // avoid redirected to be deleted
            localStorageService.set('redirected', redirected);

            if (!angular.isUndefined($http) && !angular.isUndefined($http.defaults)) {
                delete $http.defaults.headers.common["Authorization"];
            }
        };

        this.getAuthHeader = function () {
            return localStorageService.get('authtoken');
        };

        this.getUserid = function () {
            return localStorageService.get('userid');
        };

        this.getUserRoles = function () {
            var _nav = localStorageService.get('nav');
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
                        if(response.status === 401){
                            resolve(false);
                        } else{
                            reject(response);
                        }

                    });
            })
        };

        this.signout = function (removeTokenFromDB) {
            var that = this;
            return $q(function (resolve, reject) {
                if (removeTokenFromDB) {
                    var userid = localStorageService.get('userid');
                    Rh.one('_authtokens', userid).remove().then(function () {
                        that.clearAuthInfo();
                        resolve(true);
                    }, function errorCallback(response) {
                        resolve(false);
                    });
                }
                else {
                    this.clearAuthInfo();
                    resolve(true);
                }
            })
        }
    }

})();
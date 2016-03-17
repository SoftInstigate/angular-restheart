# angular-restheart

[AngularJS](https://angularjs.org) 1.x client module to handle [RESTHeart](http://restheart.org) API calls properly and easily.

## Overview

This module contains the following services:

- **RhAuth** authentication service
- **Rh** Restangular service configured for RESTHeart
- **FRh** Restangular service configured for RESTHeart with full response enabled (response headers)
- **RhLogic** Restangular service for RESTHeart Application Logic resources

For more information on Restangular refer to its [documentation](https://github.com/mgonto/restangular)

## Build and release a new version of this library

> Note: this section is for library's developers only.

1) set the VERSION number in **gulpfile.js** then

```
gulp build
```

The [gulp-bump](https://www.npmjs.com/package/gulp-bump) plugin automatically updates the version number in both **bower.json** and **package.json**.

2) `git tag` with the same VERSION

3) `git push` the new release.

4) Increase the VERSION number to the next one and run `gulp build' again, so that it's ready for the successive release.

## Installation

### Bower

```
bower install angular-restheart
```

Import the javascript component.

```html
<script src="bower_components/angular-restheart/dist/angular-restheart.min.js"></script>
```

Inject into your App.

```javascript
angular.module('myApp', ['restheart'])
```

Inject the two services into your Controller.

```javascript
.controller('MyCtrl', ['RhAuth', 'Rh',
        function (RhAuth, Rh) {

        // here your logic

        }
});
```


## Configuration

You have to configure angular-restheart before using it.

`setBaseUrl()` to set the base URL of RESTHeart.

`setLogicBaseUrl(<logic_baseurl>)` to set the base URL of RESTHeart application logic handlers (usually <baseUrl>/_logic but may differ). For more information refer to [RESTHeart documentation](https://softinstigate.atlassian.net/wiki/x/IoCw)

`onForbidden(callback)` to set the callback function the be called on error `403 - Forbidden`

`onUnauthenticated(callback)` to set the callback function the be called on `401 - Unauthorized`

`onTokenExpired(callback)` to set the callback function the be called on `401 - Unauthorized` due to token expiration

The callback functions are passed two arguments: `$location` and `$state`, that can be used for redirection.

Also, in case of errors the `rh_error` varible is set in the local storage:

```
rh_error: {"why": ["forbidded" | "expired" "not_authenticated"], "path": <path_where_error_occurred>, "state": <state_name_where_error_occurred>, "params": <state_params_object> }
```

### Configuration Example
```javascript
.config(function (restheartProvider) {
        restheartProvider.setBaseUrl("http://localhost:8080/");
        restheartProvider.setLogicBaseUrl("http://localhost:8080/_logic");
        restheartProvider.onForbidden(
            function ($location, $state) {
                $state.go("403");
                console.log("Forbidden");
            }
        );
        restheartProvider.onTokenExpired(
            function ($location, $state) {
                $state.go("signin");
                console.log("Token Expired");
            }
        );
        restheartProvider.onUnauthenticated(
            function ($location, $state) {
                $state.go("signin");
                console.log("User Unauthenticated, wrong credentials");
            }
        );
    })
```


## Authentication Flow

angular-restheart uses RESTHeart *token-based authentication* feature. For more information refer to [RESTHeart documentation](https://softinstigate.atlassian.net/wiki/x/JgDM)

The following sequence depicts the authentication flow:

### <img height="34" align="top" src="http://tech-lives.com/wp-content/uploads/2012/03/Lock-icon.png"> Sign in

1. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Enter your email and password into the login form.
2. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** On form submit call `RhAuth.signin()` with id and password.
3. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Provide username and password credentials via the basic authentication method.
4. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart Identity Manager (IDM):** Verify the user identity: if not - return `401 Unauthorized`.
5. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart Access Manager (AM):** Determine if the client is given the permission to execute it against the configured security policy:, if not - return `403 Forbidden`.
6. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart:** Create an Auth Token and send it back to the client.
7. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Parse the token and save it to *Local Storage* for subsequent.

### <img height="34" align="top" src="http://i.imgur.com/S5Ei6Rj.png"> Sign out
1. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Call `RhAuth.signout()` with a boolean parameter.
2. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart:** If `RhAuth.signout(true)` Remove Auth Token from database.
3. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Remove token from Local Storage.

## The RhAuth service

RhAuth service allows to easily authenticate a client. In case of authentication succedes, the authentication token generated by RESTHeart is saved in the session storage of the browser (with cookie fallback) and will be used by Rh* services to transparently manage authentication.

The two main public methods are `signin()` and `signout()`.

`signin(id, password)` takes two input String parameters: *id* and *password*. It returns a *promise* that is resolved to `true` if the authentication succedes and to `false` otherwise.

### Signin example
```javascript
 .controller('MyCtrl', ['RhAuth',
        function (RhAuth) {
            $scope.signin = function () {
                var promise = RhAuth.signin('riccardo', 'myP4ssword');

                promise.then(function(response) {
                    if(response) {
                        console.log("Authorized");
                    }
                    else {
                        console.log("Not Authorized");
                    }
                })

            }
        }])
```


`signout(invalidateToken)` clears the authentication token from the local storage. If `invalidateToken` is `true` it also makes a DELETE request to invalidate the authentication token from RESTHeart. Use `false` if you don't want other user sessions to get signed out.

### Signout example
```javascript
.controller('MyCtrl', ['RhAuth',
        function ( RhAuth) {
            $scope.signout = function () {
                RhAuth.signout(true);
             }
        }])
```


## Usage of Rh service

`Rh` allows you to use Restangular properly configured to work with RESTHeart.

```javascript
.controller('MyCtrl', ['Rh',
        function (Rh) {
            $scope.simpleRestangularRequest = function () {
                Rh.all('/db/coll').getList().then(function (documents) { // returns a list of the collection documents
                                console.log(documents);
                            })
                    }

        }])
```

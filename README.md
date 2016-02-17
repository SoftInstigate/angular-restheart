# angular-restheart

angular-restheart is a set of functions that simplify the usage of restheart with angualrjs.

## Installation

### Bower

```
bower install angular-restheart
```

Import the javascript component.

```html
<script src="bower_components/angular-restheart/angular-restheart.js"></script>
```

Inject into your App.

```javascript
angular.module('myApp', ['restheart'])
```

Inject the two services into your Controller.

```javascript
.controller('MyCtrl', ['RhAuth', 'Rh',
        function (RhAuth, Rh) {
        
        ... your logic here
        
        }
});
```


## Configuration

You have to configure angular-restheart before start using it.

### setBaseUrl
The base URL where RESTHeart is reachable from.

### setLogicBaseUrl
The base URL where RESTHeart _logic api is reachable from. For more information refer to [RESTHeart documentation](https://softinstigate.atlassian.net/wiki/display/RH/Application+Logic)

### onForbidden
Function the be called when ad error 403 - Forbidden is returned

### onUnauthenticated
Function the be called when ad error 401 - Unauthorized is returned 

### onTokenExpired
Function the be called when ad error 401 - Unauthorized is returned due to token expiration 


### Configuration Example
```javascript
.config(function (restheartProvider) {
        restheartProvider.setBaseUrl("http://localhost:8080/");
        restheartProvider.setLogicBaseUrl("http://localhost:8080/_logic");
        restheartProvider.onForbidden(
            function () {
                console.log("Forbidden - User Function");
            }
        );
        restheartProvider.onTokenExpired(
            function () {
                console.log("Token Expired - User Function");
            }
        );
        restheartProvider.onUnauthenticated(
            function () {
                console.log("User Unauthenticated, wrong username or password - User Function");
            }
        );
    })
```


## Authentication Flow

angular-restheart relies on *token-based authentication*. This is the way how RESTHeart authenticates the clients.
RESTHeart is stateless: there isn't any authentication session and credentials must be sent on every request. For a better understanding please refer to the [RESTHeart documentation](https://softinstigate.atlassian.net/wiki/display/RH/How+Clients+authenticate#HowClientsauthenticate-AuthenticationToken)

### <img height="34" align="top" src="http://tech-lives.com/wp-content/uploads/2012/03/Lock-icon.png"> Signin with Email and Password

1. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Enter your email and password into the login form.
2. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** On form submit call `RhAuth.signin()` with email and password.
3. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Provide username and password credentials via the basic authentication method.
4. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart Identity Manager (IDM):** Verifie the user identity:, if not - return `401 Unauthorized`.
5. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart Access Manager (AM):** Determine if the client is given the permission to execute it against the configured security policy:, if not - return `403 Forbidden`.
6. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart:** Create an Auth Token and send it back to the client.
7. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Parse the token and save it to *Local Storage* for subsequent


## Usage of RhAuth service

This service allow you to get your client authenticated.
The two main public methods are signin and signout.

`signin` takes two input parameters: id and password, both of type String. This method handles the RestHeart authentication. If the authentication is successful it is saved the authenticazion token in the browser local storage.
`signin` returns a Promise object. This promise is resolved with `true` value, if the authentication is successful, or `false` otherwise.


### Signin example
```javascript
.controller('MyCtrl', ['RhAuth', 
        function (RhAuth) {
        
            var promise = RhAuth.signin('riccardo', 'myP4ssword');
            
            promise.then(function(response) {
                if(response) {
                    console.log("Authorized");
                }
                else {
                    console.log("Not Authorized");
                }
        }])
```


`signout` takes as input a Boolean value. If the value is `true` the method makes a DELETE request to remove the authentication token from the database, and also clears the value of the token from Local Storage. If the input value passed is `false` is only deleted the token from Local Storage. This allows to handle the case where you do not want the other devices to remain connected after having the signed out.

### Signout example
```javascript
 RhAuth.signout(true);

```


## Usage of Rh service

This service allows you to use restangular properly configured to work with RESTHeart.

```javascript
.controller('MyCtrl', ['Rh',
        function (Rh) {
            $scope.simpleRestangularRequest = function () {
                Rh.all('').getList().then(function (dbs) { // returns a list of databases
                                console.log(dbs); 
                            })
                    }

        }])
```


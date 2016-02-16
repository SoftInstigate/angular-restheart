# angular-restheart-restangular

RestheartRestangular is an AngularJS service that simplifies the Restheart authentication process with a minimum of client code.


## Installation

### Bower

```
bower install angular-restheart-restangular
```

Import the javascript component.

```html
<script src="bower_components/angular-base64/angular-restheart-restangular.js"></script>
```

Inject into your App.

```javascript
angular.module('myApp', ['restheart'])
```



## Configuration

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

## Usage

```javascript
var promise = RhAuth.signin(email, password);   // SIGNIN
var promise = RhAuth.signout(true);             // SIGNOUT
```


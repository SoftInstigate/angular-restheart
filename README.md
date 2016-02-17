# angular-restheart

angular-restheart is a set of features to simplify the use of restheart with angualrjs.


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


## Authentication Flow

angular-restheart relies on *token-based authentication*. This is the way how RESTHeart authenticates the clients. RESTHeart is stateless: there isn't any authentication session and credentials must be sent on every request.
For a better understanding please refer to the official [RESTHeart documentation](https://softinstigate.atlassian.net/wiki/display/RH/How+Clients+authenticate#HowClientsauthenticate-AuthenticationToken)

### <img height="34" align="top" src="http://tech-lives.com/wp-content/uploads/2012/03/Lock-icon.png"> Signin with Email and Password

1. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Enter your email and password into the login form.
2. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** On form submit call `RhAuth.signin()` with email and password.
3. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Provides username and password credentials via the basic authentication method.
4. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart Identity Manager (IDM):** verifies the user identity:, if not - return `401 Unauthorized`.
5. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart Access Manager (AM):** determines if the client is given the permission to execute it against the configured security policy:, if not - return `403 Forbidden`.
6. <img height="24" align="top" src="http://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/256/Places-network-server-database-icon.png"> **RestHeart:** Create an Auth Token and send it back to the client.
7. <img height="24" align="top" src="https://i.ytimg.com/i/bn1OgGei-DV7aSRo_HaAiw/mq1.jpg?v=4f8f2cc9"> **Client:** Parse the token and save it to *Local Storage* for subsequent


## Usage

```javascript
var promise = RhAuth.signin(email, password);   // SIGNIN
var promise = RhAuth.signout(true);             // SIGNOUT
```


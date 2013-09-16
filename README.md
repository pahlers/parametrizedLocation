#parametrizedLocation

Extend angular.$location with support for a parametrized URL template with parameters (like angular.$resource) prefixed by `:`. And added a filter paramsUrl.

$resource documentation: http://docs.angularjs.org/api/ngResource.$resource
$location documentation: http://docs.angularjs.org/api/ng.$location


##Install
Install with bower.
```shell
bower install --save parametrizedLocation
```

How to use
```js
angular.module('moduleName', ['parametrizedLocation']);
```

##Methods
$location.url
```js
$location.url('/url/:id', {id:123, test:'test'});
//return $location, browser jumps to '/url/123?test=test'
```

$location.path
```js
$location.path('/url/:id', {id:123, test:'test'});
//return $location, browser jumps to '/url/123'
```

$location.hash
```js
$location.hash(':foo', {foo:'bar'});
//return $location, browser jumps to '#bar'
```

##Filters
paramsUrl
```js
$filter('paramsUrl')('/url/:id', {id:123, test:'test'});
//return /url/123?test=test
```

Or

```html
<a href="{url | paramsUrl:params}">…</a>
<!-- <a href="/url/123?test=test">…</a> -->
```

##Todo
* more tests (Statements: 88.16% (67 / 76), Branches: 71.11% (32 / 45), Functions: 82.35% (14 / 17), Lines: 88.16% (67 / 76))

##Thanks
* Gruntfile inspiration: https://github.com/mgonto/restangular
* Code inspiration: Angular $location, $http and $resource
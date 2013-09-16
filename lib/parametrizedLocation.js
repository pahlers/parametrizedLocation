(function(window, document, undefined) {
  'use strict';

  var PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/;

  /**
   * Encode path using encodeUriSegment, ignoring forward slashes
   *
   * @param {string} path Path to encode
   * @returns {string}
   */
  function encodePath(path) {
    var segments = path.split('/'),
        i = segments.length;

    while (i--) {
      segments[i] = encodeUriSegment(segments[i]);
    }

    return segments.join('/');
  }

  /**
   * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
   * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
   * segments:
   *    segment       = *pchar
   *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
   *    pct-encoded   = "%" HEXDIG HEXDIG
   *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
   *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
   *                     / "*" / "+" / "," / ";" / "="
   *
   * Copied from angular-resource.js
   */
  function encodeUriSegment(val) {
    return encodeUriQuery(val, true).
             replace(/%26/gi, '&').
             replace(/%3D/gi, '=').
             replace(/%2B/gi, '+');
  }

  /**
   * This method is intended for encoding *key* or *value* parts of query component. We need a custom
   * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
   * encoded per http://tools.ietf.org/html/rfc3986:
   *    query       = *( pchar / "/" / "?" )
   *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
   *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
   *    pct-encoded   = "%" HEXDIG HEXDIG
   *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
   *                     / "*" / "+" / "," / ";" / "="
   *
   * Copied from angular-resource.js
   */
  function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
               replace(/%40/gi, '@').
               replace(/%3A/gi, ':').
               replace(/%24/g, '$').
               replace(/%2C/gi, ',').
               replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
  }

  /**
   * Private function to sort the keys
   *
   * Copied from angular.js
   */
  function sortedKeys(obj) {
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys.sort();
  }

  /**
   * Private function to iterate over a sorted list.
   *
   * Copied from angular.js
   */
  function forEachSorted(obj, iterator, context) {
    var keys = sortedKeys(obj);
    for ( var i = 0; i < keys.length; i++) {
      iterator.call(context, obj[keys[i]], keys[i]);
    }
    return keys;
  }

  /**
   * Private function to add extra paramaters in the url.
   *
   * Copied from angular.js ($http.buildUrl)
   */
  function addExtraParams(urlOrg, params) {
    if (!params){
      return urlOrg;
    }

    var parts = [],
      url = urlOrg,
      hash = '';

    if(urlOrg.split('#').length > 1){
      url = urlOrg.slice(0, urlOrg.lastIndexOf('#'));
      hash = urlOrg.slice(urlOrg.lastIndexOf('#'));
    }

    forEachSorted(params, function(value, key) {
      if (value === null || value === undefined){
        return;
      }
      if (!angular.isArray(value)){
        value = [value];
      }

      angular.forEach(value, function(v) {
        if (angular.isObject(v)) {
          v = angular.toJson(v);
        }
        parts.push(key + '=' + v);
      });
    });

    return url + ((url.indexOf('?') === -1) ? '?' : '&') + parts.join('&') + hash;
  }

  /**
   * Private function to set the paramaters in the url.
   *
   * Copied from angular-resource.js (setUrlParams)
   */
  function setLocationParams(url, params, addTheExtraParamsPlease) {
    var val,
      // encodedVal,
      urlParams = {},
      extraParams = {},
      extraParamsAdded = false;

    angular.forEach(url.split(/\W/), function(param){
      if (!(new RegExp('^\\d+$').test(param)) && param && (new RegExp('(^|[^\\\\]):' + param + '(\\W|$)').test(url))) {
        urlParams[param] = true;
      }
    });
    url = url.replace(/\\:/g, ':');

    params = params || {};
    angular.forEach(urlParams, function(_, urlParam){
      val = params[urlParam];
      if (angular.isDefined(val) && val !== null) {
        // encodedVal = encodeUriSegment(val);
        url = url.replace(new RegExp(':' + urlParam + '(\\W|$)', 'g'), val + '$1');
      } else {
        url = url.replace(new RegExp('(\/?):' + urlParam + '(\\W|$)', 'g'), function(match,
            leadingSlashes, tail) {
          if (tail.charAt(0) === '/') {
            return tail;
          } else {
            return leadingSlashes + tail;
          }
        });
      }
    });

    // strip trailing slashes and set the url
    url = url.replace(/\/+$/, '');
    // then replace collapse `/.` if found in the last URL path segment before the query
    // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
    url = url.replace(/\/\.(?=\w+($|\?))/, '.');
    // replace escaped `/\.` with `/.`
    url = url.replace(/\/\\\./, '/.');

    angular.forEach(params, function(value, key){
      if (!urlParams[key]) {
        extraParamsAdded = true;
        extraParams[key] = value;
      }
    });

    if(addTheExtraParamsPlease && extraParamsAdded){
      url = addExtraParams(url, extraParams);
    }

    return url;
  }

  angular.module('parametrizedLocation',[])
    .config(['$provide', function($provide) {

      /**
       * @ngdoc overview
       * @name parametrizedLocation
       * @requires $provide
       * @requires $location
       * @requires $delegate
       */

      $provide.decorator('$location', ['$delegate', function($delegate) {
        // Cache the original $location methods
        var cacheUrlMethod = $delegate.url,
          cachePathMethod = $delegate.path,
          cacheHashMethod = $delegate.hash;

        /**
         * @ngdoc method
         * @name ng.$location#url
         * @methodOf ng.$location
         *
         * @description
         * This method is getter / setter.
         *
         * Return url (e.g. `/path?a=b#hash`) when called without any parameter.
         *
         * Change path, search and hash, when called with parameter and return `$location`.
         *
         * @param {string=} url A parametrized URL template with parameters prefixed by `:` as in
         *    `/user/:username`. If you are using a URL with a port number (e.g.
         *    `http://example.com:8080/api`), it will be respected.
         * @param {string=} replace The path that will be changed
         * @param {Object=} params Optional set of pre-bound parameters for this action. If any of the
         *     parameter value is a function, it will be executed every time when a param value needs to be
         *     obtained for a request (unless the param was overridden).
         * @return {string} url
         */
        $delegate.url = function(url, replace, params) {
          if(angular.isObject(replace)){
            params = replace;
            replace = undefined;
          }

          if(angular.isObject(params)){
            url = setLocationParams(url, params, true);
          }

          // Call the cached mathod to finish the 
          return cacheUrlMethod.call($delegate, url, replace);
        };

        /**
         * @ngdoc method
         * @name ng.$location#path
         * @methodOf ng.$location
         *
         * @description
         * This method is getter / setter.
         *
         * Return path of current url when called without any parameter.
         *
         * Change path when called with parameter and return `$location`.
         *
         * Note: Path should always begin with forward slash (/), this method will add the forward slash
         * if it is missing.
         *
         * @param {string=} path A parametrized Path template with parameters prefixed by `:` as in
         *    `/user/:username`.
         * @param {Object=} params Optional set of pre-bound parameters for this action. If any of the
         *     parameter value is a function, it will be executed every time when a param value needs to be
         *     obtained for a request (unless the param was overridden).
         * @return {string} path
         */
        $delegate.path = function(path, params) {
          if(angular.isObject(params)){
            path = setLocationParams(path, params);
          }

          return cachePathMethod.call($delegate, path);
        };

        /**
         * @ngdoc method
         * @name ng.$location#hash
         * @methodOf ng.$location
         *
         * @description
         * This method is getter / setter.
         *
         * Return hash fragment when called without any parameter.
         *
         * Change hash fragment when called with parameter and return `$location`.
         *
         * @param {string=} hash A parametrized hash fragment template with parameters prefixed by `:` as in
         *    `:username`.
         * @param {Object=} params Optional set of pre-bound parameters for this action. If any of the
         *     parameter value is a function, it will be executed every time when a param value needs to be
         *     obtained for a request (unless the param was overridden).
         * @return {string} hash
         */
        $delegate.hash = function(hash, params) {
          if(angular.isObject(params)){
            hash = setLocationParams(hash, params);
          }

          return cacheHashMethod.call($delegate, hash);
        };

        return $delegate;
      }]);

    }])

    /**
     * @name filter:paramsUrl
     * @function
     
     * @description
     * 
     * It's returns an url when called with a url template and the parameters.
     * A nice way to generate url's in your controller or view.
     *
     * @param {string} url A parametrized URL template with parameters prefixed by `:` as in
     *    `/user/:username`. If you are using a URL with a port number (e.g.
     *    `http://example.com:8080/api`), it will be respected.
     * @param {Object} params Optional set of pre-bound parameters for this action. If any of the
     *     parameter value is a function, it will be executed every time when a param value needs to be
     *     obtained for a request (unless the param was overridden).
     * @return {string} url
     */
    .filter('paramsUrl', function() {

      return function(url, params) {
        if(!angular.isObject(params)){
          return url;
        }

        var match = PATH_MATCH.exec(setLocationParams(url, params, true)),
          path = '',
          search = '',
          hash = '';

        if(match[1]){
          path = encodePath(match[1]);
        }
        if(match[2] || match[1]){
          search = '?' + encodeUriSegment(match[3] || '');
        }
        if(match[5]){
          hash = '#' + encodeUriSegment(match[5]);
        }

        return path + search + hash;
      };
    });

})(window, document);

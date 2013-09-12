'use strict';


describe('parametrizedLocation', function() {
  // load the controller's module
  beforeEach(module('parametrizedLocation'));

  var url;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($location) {
    $location.$$parse('http://www.domain.com:9877/#/path/b?search=a&b=c&d#hash');
    url = $location;
  }));

  it('sould load $location', function() {
    expect(url).not.toBe(null);
    expect(url).not.toBe(undefined);

    expect(url.url).not.toBe(undefined);
    expect(url.path).not.toBe(undefined);
    expect(url.hash).not.toBe(undefined);
  });

  describe('NewUrl', function() {
    it('should provide common getters', function() {
      expect(url.absUrl()).toBe('http://www.domain.com:9877/#/path/b?search=a&b=c&d#hash');
      expect(url.protocol()).toBe('http');
      expect(url.host()).toBe('www.domain.com');
      expect(url.port()).toBe(9877);
      expect(url.path()).toBe('/path/b');
      expect(url.search()).toEqual({search: 'a', b: 'c', d: true});
      expect(url.hash()).toBe('hash');
      expect(url.url()).toBe('/path/b?search=a&b=c&d#hash');
    });

    it('should change the url', function() {
      url.url('/path/:test?search=:test2&b=c&d#:test4', {test:'AbbyCadabby', test2:'Adam T. Glasser', test3:'Alice Snuffleupagus', test4: 'Alistair Cookie'});

      expect(url.absUrl()).toBe('http://www.domain.com:9877/#/path/AbbyCadabby?search=Adam%20T.%20Glasser&b=c&d&test3=Alice%20Snuffleupagus#Alistair%20Cookie');
      expect(url.protocol()).toBe('http');
      expect(url.host()).toBe('www.domain.com');
      expect(url.port()).toBe(9877);
      expect(url.path()).toBe('/path/AbbyCadabby');
      expect(url.search()).toEqual({ search : 'Adam T. Glasser', b : 'c', d : true, test3 : 'Alice Snuffleupagus' });
      expect(url.hash()).toBe('Alistair Cookie');
      expect(url.url()).toBe('/path/AbbyCadabby?search=Adam%20T.%20Glasser&b=c&d&test3=Alice%20Snuffleupagus#Alistair%20Cookie');
    });

    it('should change the path', function() {
      url.path('/path/:test', {test:'AmazingMumford', test2:'Anne Phibian'});

      expect(url.absUrl()).toBe('http://www.domain.com:9877/#/path/AmazingMumford?search=a&b=c&d#hash');
      expect(url.protocol()).toBe('http');
      expect(url.host()).toBe('www.domain.com');
      expect(url.port()).toBe(9877);
      expect(url.path()).toBe('/path/AmazingMumford');
      expect(url.search()).toEqual({ search : 'a', b : 'c', d : true });
      expect(url.hash()).toBe('hash');
      expect(url.url()).toBe('/path/AmazingMumford?search=a&b=c&d#hash');
    });

    it('should change the hash', function() {
      url.hash('hash\::test', {test:'Aristotle', test2: 'Baby Bear'});

      expect(url.absUrl()).toBe('http://www.domain.com:9877/#/path/b?search=a&b=c&d#hash:Aristotle');
      expect(url.protocol()).toBe('http');
      expect(url.host()).toBe('www.domain.com');
      expect(url.port()).toBe(9877);
      expect(url.path()).toBe('/path/b');
      expect(url.search()).toEqual({ search : 'a', b : 'c', d : true });
      expect(url.hash()).toBe('hash:Aristotle');
      expect(url.url()).toBe('/path/b?search=a&b=c&d#hash:Aristotle');
    });

  });

});

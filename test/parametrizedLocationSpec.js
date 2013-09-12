'use strict';
/*global describe, beforeEach, inject, it, expect*/

describe('parametrizedLocation', function() {
  // load the controller's module
  beforeEach(module('parametrizedLocation'));

  var url;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($location) {
    url = $location;
  }));

  it('should load $location', function() {
    expect(url).not.toBe(null);
    expect(url).not.toBe(undefined);

    expect(url.url).not.toBe(undefined);
    expect(url.path).not.toBe(undefined);
    expect(url.hash).not.toBe(undefined);
  });

  describe('methods', function() {
    it('should provide common getters', function() {
      expect(url.absUrl()).toBe('http://server/');
      expect(url.protocol()).toBe('http');
      expect(url.host()).toBe('server');
      expect(url.port()).toBe(80);
      expect(url.path()).toBe('');
      expect(url.search()).toEqual({});
      expect(url.hash()).toBe('');
      expect(url.url()).toBe('');
    });

    it('should change the url', function() {
      url.url('/path/:test?search=:test2&b=c&d#:test4', {test:'AbbyCadabby', test2:'Adam T. Glasser', test3:'Alice Snuffleupagus', test4: 'Alistair Cookie'});

      expect(url.absUrl()).toBe('http://server/#/path/AbbyCadabby?search=Adam%20T.%20Glasser&b=c&d&test3=Alice%20Snuffleupagus#Alistair%20Cookie');
      expect(url.protocol()).toBe('http');
      expect(url.host()).toBe('server');
      expect(url.port()).toBe(80);
      expect(url.path()).toBe('/path/AbbyCadabby');
      expect(url.search()).toEqual({ search : 'Adam T. Glasser', b : 'c', d : true, test3 : 'Alice Snuffleupagus' });
      expect(url.hash()).toBe('Alistair Cookie');
      expect(url.url()).toBe('/path/AbbyCadabby?search=Adam%20T.%20Glasser&b=c&d&test3=Alice%20Snuffleupagus#Alistair%20Cookie');
    });

    it('should change the path', function() {
      url.path('/path/:test', {test:'AmazingMumford', test2:'Anne Phibian'});

      expect(url.absUrl()).toBe('http://server/#/path/AmazingMumford');
      expect(url.protocol()).toBe('http');
      expect(url.host()).toBe('server');
      expect(url.port()).toBe(80);
      expect(url.path()).toBe('/path/AmazingMumford');
      expect(url.search()).toEqual({});
      expect(url.hash()).toBe('');
      expect(url.url()).toBe('/path/AmazingMumford');
    });

    it('should change the hash', function() {
      url.hash('hash\::test', {test:'Aristotle', test2: 'Baby Bear'});

      expect(url.absUrl()).toBe('http://server/##hash:Aristotle');
      expect(url.protocol()).toBe('http');
      expect(url.host()).toBe('server');
      expect(url.port()).toBe(80);
      expect(url.path()).toBe('');
      expect(url.search()).toEqual({});
      expect(url.hash()).toBe('hash:Aristotle');
      expect(url.url()).toBe('#hash:Aristotle');
    });

  });

});

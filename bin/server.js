#!/usr/bin/env node
require('../server.babel'); // babel registration (runtime transpilation for node)
var path = require('path');
var rootDir = path.resolve(__dirname, '..');

/**
 * Define isomorphic constants.
 */
global.__CLIENT__ = false;
global.__SERVER__ = true;
global.__DISABLE_SSR__ = false;  // <----- DISABLES SERVER SIDE RENDERING FOR ERROR DEBUGGING
global.__DEVELOPMENT__ = process.env.NODE_ENV !== 'production';
global.__DBLOCATION__ = process.env.DBLOCATION || 'tmp';
global.__LOGPATH__ = process.env.LOGPATH || 'logs';
global.__IMAGESPATH__ = process.env.IMAGESPATH || 'tmpPictures';
global.__BASEURL__ = process.env.BASE_URL || '';

if (__DEVELOPMENT__) {  
  if (!require('piping')({
      hook: true,
      ignore: /(\/\.|~$|\.json|\.scss$)/i
    })) {
    return;
  }
}

require('../src/server');

//// https://github.com/halt-hammerzeit/webpack-isomorphic-tools
//var WebpackIsomorphicTools = require('webpack-isomorphic-tools');
//global.webpackIsomorphicTools = new WebpackIsomorphicTools(require('../webpack/webpack-isomorphic-tools'))
//  .development(__DEVELOPMENT__)
//  .server(rootDir, function() {
//    require('../src/server');
//  });

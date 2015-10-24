var util = require('util');
var fs = require('fs');
var _async = require('async');
var R = require('ramda');
var minify = require('minify');
var request = require('request')

var packages = R.mapObjIndexed(function(v,l){
  return [l, v.replace(/[\~\=\^]/g,'')];
})

var libraries = R.values(packages(JSON.parse(fs.readFileSync('bower.json', 'utf-8')).dependencies));
var indexHtml = fs.readFileSync('app/index.html', 'utf-8')

_async.map(libraries, function(lib,cb){
  (function fetch(lib, js){
    request('https://cdnjs.com/libraries/' + lib[0] + (js ? '.js' : '') + '/' + lib[1], function(e,r,body) {
        try {
          cb(null, [lib[0], new RegExp("library-url'\>.*"+lib[0]+"(.min)?\.js<").exec(body)[0].replace(/.*>(.*)<.*/, '$1')]);
        } catch (e){
          if (! /angular/.test(lib[0])) {
            if (!js) return fetch([lib[0],lib[1]], true)
              return cb(null, [lib[0]]);
          }
          cdn = 'https://cdnjs.cloudflare.com/ajax/libs/angular.js/'+lib[1]+'/'+lib[0] + '.min.js'
            return request(cdn, function(e,r) {
              cb(null, r.statusCode != 404 ? [lib[0], r.request.href] : [lib[0]]);
            })
        }
        })
  })(lib);
}, function(e,r) {
  R.map(function(lib){
    indexHtml = indexHtml.replace(new RegExp('["\'].*bower_components.*'+lib[0]+'(.min)?\.js["\']','gi'), lib[1] + '"')
  }, R.filter(function(e){return e[1]}, r))
  var shouldBeMinified = [];
  indexHtml = indexHtml.replace(/<script.*\/bower_components.*.js.*script>\n/g, function(lib){
    shouldBeMinified.push(/bower_components.*js/.exec(lib)[0]);
    return '';
  })
  _async.map(shouldBeMinified, minify, function(e,r){
    indexHtml = indexHtml.replace('</head>', "\t<script src='bower_components/minified.js'></script>\n</head>")
      fs.writeFileSync('bower_components/minified.js', r.join('\n'))
      fs.writeFileSync('app/index-cdn.html', indexHtml);
    console.log('Done')
  })
});

Exec: ```node_modules/.bin/bower2cdn```

#Pile of shitty code that:
1. Read bower.rc
2. Try to find your dependencies on cdnjs.com
3. Substitute bower_components links with cdnjs links in app/index.html
4. Libraries were not found on cdnjs minified and concatenated into bower_components/minified.js
5. New index-cdn.html written

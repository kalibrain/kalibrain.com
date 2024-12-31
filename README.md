# kalibrain.com

---

### Build
Server
````
python3 -m http.server
````

Styles  
````
sass --watch scss/main.scss:css/style.min.css --style compressed
````

Scripts
````
terser js/photos.js js/map.js js/bucket.js js/script.js --source-map -m -o js/script.terser.js

chokidar js/*.js -c "terser js/photos.js js/bucket.js js/script.js --source-map -m -o js/script.terser.js"
````

---


### Resources
Things I used during the development process.
 - [FaviconGenerator](https://realfavicongenerator.net/) - Favicon generator. For real.

SASS source files in the `scss` directory. All JS files in the `js` directory, then combined and minified for production.

Map related functions are in `js/maps.js` but the request to get latest versions of MapboxGL from the CDN is in `js/scriptj.s`.

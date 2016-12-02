# Perfect JS
Remove all unwanted require, exports, or source-map statements from a file and clean a single clean JavaScript file. A clean flat file with no extra code for external dependence tree modulation.

## Get Started
All you need is to 

1. Get this perfect.js into  project root directory.
2. Require perfect.js file into your gulp or grunt
  ```javascript
  let Perfect = require("perfect.js").Perfect;

  new Perfect("from/raw/files.js","to/clean/single.js")
  ```
3. If you want to watch the files for changes go ahead

  ```javascript
  new Perfect("from/raw/files.js","to/clean/single.js").watch()
  ```
  
As of now  this supports perfection of js files directly so long there is require(files) to be converted to a single file js.

When using TypeScript give the link to your compiled entry.js file as the first argument to Perfect.   

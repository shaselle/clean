# Clean JS
Replaces all the require and export statements in file with the actual js file content, and compiles them into one 
single perfect JavaScript file for the whole project.

## Get Started
This guide will help you get started with cleanJS in no time. Using Clean JS is as eas an installing it, requiring and 
running it.

You can , also clean source-maps statements from a file for a clean flat file with no extra code for external 
dependence tree modulation.

### Prerequisites

To use this module you will need NodeJs and npm installed on your system

```
Give examples
```


### Installing

1. Get this clean.js into  project root directory.
   
2. Require clean.js file into your gulp or grunt
  ```javascript
  let Clean = require("perfect.js").Clean;

  new Clean("from/raw/files.js","to/clean/single.js")
  ```
3. If you want to watch the files for changes go ahead

  ```javascript
  new Perfect("from/raw/files.js","to/clean/single.js").watch()
  ```
  
As of now  this supports cleaning of js files directly so long there is require(files) to be converted to a single file js.

When using TypeScript give the link to your compiled entry.js file as the first argument to Perfect.   

### Results and benefits
A successful Clean JS run gives you :-

1. A clean single JavaScript file 
2. Less code unlike what you get when using build sytem/browserify
3. Its straight forward and browser compatible js
4. Improved code readability
5. A simple new file while leaving your project intact
6. Live Updates as  project file/s  change 
7. Satisfaction fro getting rid of unnecessary require overhead from project.



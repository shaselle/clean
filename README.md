# Clean JS
----
Replaces all the require and export statements with the actual js content from the required file.
Compiles all your project's js file tree into one single perfect JavaScript file.

## Get Started
This guide will help you get started with cleanJS in no time. 
Using Clean JS is as easy as installing it, requiring and running it. 

## Prerequisites

To use this module you will need NodeJs and/or npm installed on your development system.
If you are using only node, then get a copy of the clean.js from the git repo and use it. 
Otherwise I  assume that you have both Node and npm installed.

## Installing


1. Get this CleanJS into  project's npm dev devDependencies.

    ```bash
    npm install --save-dev cleanjs
    ```
   
2. Require clean.js file into your gulp or grunt file
    ```javascript
    let CleanJS = require("cleanjs").Clean;
    
    new CleanJS("from/raw/entry.js","to/clean/single.js")
    ```
3. If you want to watch the files for changes go ahead

    ```javascript
    new CleanJS("from/raw/files.js","to/clean/single.js").watch()
    ```
4. Run as npm script
    

As of now  this supports cleaning of js files directly so long there is require(files) to be converted to a single file js.

When using TypeScript give the link to your compiled entry.js file as the from argument to Perfect. 

## Feature options
-----

1. Clean out all require and export statements
    This is the sore aim of Clean JS, to give you a clear **require-less**  and **export-free** code.
    
    0. Declare new Clean Object 
    
        ```javascript
        
        new Clean(from : string, to :string, [options: Object ]);
        ```
         **from** : *string*
                path to file.js from which all the require/export statement will be to be cleaned.
                
         **to** : *string* 
                path clean_file.js to which all clean js content will be written.
                
         **options**: *Object*
                Plain JavaScript object specifying Clean Js preferences.
    
2. Clean out all source-maps.

    This is preference based feature option, that lets you to clean out all the source maps produced
    by transpilers such as Typescript or Babel
    
    **removeSourceMapComment** : *boolean* [false]
         Setting this option will tell CleanJS to remove source maps from the clean.js file.
    
3. Optimizes the js strict mode.

    This allows you to optimize all "use strict" statements. Clean Js simply removes all and 
    keeps  only one  major "use strict" to mark strict mode for the whole file.
    
    **optimizeStrictMode** : *boolean* [true]


4. Optimizes strict mode by default and leaves source maps on through out development.

    ```javascript
    Clean(
         from : string, 
         
         to : string, 
         
         options : Object = {
         
            removeSourceMapComment: false, 
            
            optimizeStrictMode: true
         }
     );
    ```
    

This gives a  clean flat file with no extra code from external dependence tree modulation.


### Results and benefits
----
A successful Clean JS run gives you :-

1. A clean single JavaScript file 
2. Less code unlike what you get when using build system /browserify
3. Its straight forward and browser compatible js
4. Improved code readability
5. A simple new file while leaving your project intact
6. Live Updates as  project file/s  change 
7. Satisfaction for getting rid of unnecessary require+ overhead from project project.



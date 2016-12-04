/**---------------------------------------------------------------------------
 * Author  : Shadrack
 * Date    : 28/11/16.
 * Name    : CleanJS
 * Version : 1.0.1
 * Purpose : Cleans and include all require(files) in one single file js file
 *-------------------------------------------------------------------------*/
"use strict";
const fs = require("fs");
const path = require("path");
/**-----------------------------------------------------------------------
 * CLi line content padding
 * @param size
 * @param chars
 * @param buffer
 * @param l
 * @param r
 * @param favour
 * @return {string}
 *----------------------------------------------------------------------*/
function pad(size, chars, buffer = 2, l = " ", r = " ", favour = "r") {
    let p = Math.floor((size - (chars.length + buffer)) / 2);
    let pl = `${l}`.repeat(p);
    let pr = `${r}`.repeat(p);
    let dif;
    if ((dif = (size - `${pl} ${chars} ${pr}`.length))) {
        if (favour === "r") {
            pr = pr + r.repeat(dif);
        }
        else if (favour === "l") {
            pl = pl + l.repeat(dif);
        }
    }
    return `${pl} ${chars} ${pr}`;
}
/**
 * FileX is placeholder Object class any x file in the
 * given project tree
 * */
class FileX {
    constructor() {
        this.url = "";
        this.name = "";
        this.destination = "";
        this.require = "";
        this.data = "";
    }
}
//noinspection JSUnusedGlobalSymbols
/**
 * Clean class is Object class that has
 * all necessary methods and algorithms for mapping parsing and optimizing
 * a given module to a clean single file
 * */
class Clean {
    //noinspection JSUnusedGlobalSymbols
    /**
     * Perfect Constructor
     * @param from : string Path of the file or entry file to a module file
     * @param to : string
     * @param options
     */
    constructor(from, to, options = {removeSourceMapComment: false, optimizeStrictMode: true}) {
        this.options = options;
        this.rawFile = path.resolve(from);
        this.files = [];
        this.dirNames = [];
        this.clanFile = path.resolve(to);
        this.regex = /((const|let|var)\s*)(\w+[0-9]*)(\s*=\s*)(require\s*\(")(.*\/*\w+[0-9]*)("\s*\)\s*;)/g;
        this.mapTree();
        this.parseModuleTree();
    }
    /**
     * Maps the whole file finds all require statements and creates
     * an optimal map of file-dependant linked list
     */
    mapTree() {
        this.files.push({name: "base", url: this.rawFile, destination: "-base|7777|@/201020", data: ""});
        for (let ii = 0; ii < this.files.length; ii++) {
            let file = this.files[ii];
            let data = fs.readFileSync(file.url, "utf-8");
            if (file.data) {
                this.files[file.data].data = "";
            }
            file.data = data;
            let m;
            while ((m = this.regex.exec(data)) !== null) {
                let fileX = new FileX();
                fileX.url = path.resolve(path.dirname(file.url), m[6] + ".js");
                fileX.name = m[3];
                fileX.destination = file.url;
                fileX.require = m[0];
                for (let i in this.files) {
                    if (this.files.hasOwnProperty(i)) {
                        let fileY = this.files[i];
                        if (fileY.url === fileX.url) {
                            fileX.data = i;
                            break;
                        }
                    }
                }
                this.files.push(fileX);
            }
        }
        this.files.reverse();
    }
    /**
     * Parses the linked list created by Perfect.mapTree() and
     * finally flattens the file into a single clean file
     */
    parseModuleTree() {
        for (let i = 0; i < this.files.length; i++) {
            let fileX = this.files[i];
            if (fileX.destination === "-base|7777|@/201020") {
                fs.writeFileSync(this.clanFile, fileX.data, {encoding: "utf-8", mode: 0o666, flag: 'w'});
                return;
            }
            else {
                let destination;
                for (let i in this.files) {
                    if (this.files.hasOwnProperty(i)) {
                        let fileY = this.files[i];
                        if (fileY.url === fileX.destination) {
                            destination = i;
                            break;
                        }
                    }
                }
                if (this.options.optimizeStrictMode) {
                    fileX.data = fileX.data.replace(/"use strict";/g, "");
                }
                this.files[destination].data = this.files[destination].data.replace(fileX.require, fileX.data);
                this.files[destination].data = this.files[destination].data.replace(new RegExp(`${fileX.name}.`, 'g'), "");
                this.files[destination].data = this.files[destination].data.replace(/(exports.\w+\s*=\s*\w+\s*;)/g, '');
                if (this.options.removeSourceMapComment) {
                    this.files[destination].data = this.files[destination].data.replace(/(\/\/#\s*sourceMappingURL=\w*.js.map)/g, '');
                }
            }
        }
    }
    //noinspection JSUnusedGlobalSymbols
    /**
     * Watches all the files of the dependency files and ushers in
     * a new perfection each time any of the raw dependency files
     * changes
     */
    watch() {
        let urls = this.files.map((file) => {
            return file.url;
        });
        console.log("");
        console.log("-".repeat(100));
        let title = "watching and perfecting";
        console.log(pad(100, title.toLocaleUpperCase(), 2, "-", "-"));
        console.log("-".repeat(100));
        urls.forEach((url, index) => {
            let dirName = path.dirname(url);
            if (!this.dirNames.includes(dirName)) {
                let relPath = `(${index}). ` + path.relative(".", dirName);
                console.log(`${relPath + ".".repeat(100 - relPath.length)}`);
                this.dirNames.push(dirName);
            }
        });
        console.log("-".repeat(100), "\n\n");
        this.dirNames.forEach((dirName) => {
            fs.watch(dirName, {encoding: "utf-8"}, (eventType, filename) => {
                if (filename && path.extname(filename) === ".js" && filename !== path.basename(this.clanFile)) {
                    let d = new Date();
                    let h = (d.getHours() < 10) ? d.getHours() : "0" + d.getHours();
                    let m = (d.getMinutes() < 10) ? d.getMinutes() : "0" + d.getMinutes();
                    console.log(`${pad(20, filename, 2, "-")} `, ` ${eventType}ed @ ${h}:${m}:${d.getSeconds()}:${d.getMilliseconds()}`, ` perfected `, this.clanFile);
                    new Clean(this.rawFile, this.clanFile, this.options);
                }
            });
        });
        if (process.platform === "win32") {
            let rl = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.on("SIGINT", function () {
                process.emit("SIGINT");
            });
        }
        process.on("SIGINT", function () {
            process.exit();
        });
    }
}
exports.Clean = Clean;
//# sourceMappingURL=clean.js.map
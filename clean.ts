/**-------------------------------------------------------------------------
 * Created by shadrack on 28/11/16.
 * Name    : Perfect
 * Purpose : Clean and include all require(files) in one single file js file
 *------------------------------------------------------------------------*/
"use strict";
import fs = require('fs')
import path = require('path')

/**---------------------------------------------------------------------------
 * CLi line content padding
 * @param size
 * @param chars
 * @param buffer
 * @param l
 * @param r
 * @param favour
 * @return {string}
 *--------------------------------------------------------------------------*/
function pad(size, chars, buffer = 2, l = " ", r = " ", favour = "r") {
    let p = Math.floor((size - (chars.length + buffer)) / 2);
    let pl = `${l}`.repeat(p);
    let pr = `${r}`.repeat(p);
    let dif;
    if ((dif = (size - `${pl} ${chars} ${pr}`.length))) {
        if (favour === "r") {
            pr = pr + r.repeat(dif)
        } else if (favour === "l") {
            pl = pl + l.repeat(dif)
        }
    }
    return `${pl} ${chars} ${pr}`
}


class Directory {
    get path(): Path {
        return this._path;
    }

    get name(): string {
        return this._name;
    }

    private _name: string;
    private _path: Path;

    constructor(name: string) {
        this._name = name;
        this._path = new Path(this._name)
    }
}


class Path {
    private _url;

    isRelative(): boolean {
        return path.resolve(this._url) !== this._url;
    }

    get url(): string {
        return this._url;
    }

    private _directory: Directory;

    constructor(url: string|Path) {
        this._url = url;
        this.normalize();
        this._directory = new Directory(path.dirname(this.url));
    }

    /**----------------------------------------------------------------
     * Path  directory
     * --------------------------------------------------------------*/
    directory(): Directory {
        return this._directory;
    }

    /**---------------------------------------------------------------
     * normalize
     *---------------------------------------------------------------*/
    normalize() {
        this._url = path.normalize(this._url);
    }

    /**--------------------------------------------------------------
     * Path is(url) check if the path is the one with given url
     * */
    is(url: any) {
        return this._url === url
    }


    /**---------------------------------------------------------------
     * Path  isFile() in fs
     * -------------------------------------------------------------*/
    isFile(): boolean {
        try {
            return fs.lstatSync((this._url)).isFile()
        } catch (error) {
            if (error.code === "ENOENT") {
                return false;
            } else {
                throw  error;
            }
        }
    }

    /**--------------------------------------------------------------
     * Path isDirectory() in fs
     * ------------------------------------------------------------*/
    isDirectory(): boolean {
        try {
            return fs.lstatSync(this._url).isDirectory()
        } catch (error) {
            if (error.code === "ENOENT") {
                return false;
            } else {
                throw  error;
            }
        }

    }

    /**-------------------------------------------------------------
     * The Path.resolve() Resolves this.url into an absolute path.
     * -----------------------------------------------------------*/
    resolve(parent: Path, onlyOnExists?: boolean) {
        const url = this._url;
        this._url = path.resolve(parent.directory().name, this._url);
        if (onlyOnExists && !this.isFile()) {
            this._url = url;
        }
    }

    /**------------------------------------------------------------
     * Path add setExt
     * @param extensionName
     * @param onlyOnExists add existension if on the file exists
     *----------------------------------------------------------*/
    setExt(extensionName: string, onlyOnExists?: boolean) {
        const url = this._url;
        this._url = this._url + "." + extensionName;
        if (onlyOnExists && !this.isFile()) {
            this._url = url;
        }
    }

    /**--------------------------------------------------------
     * Path joins and produces a new path.
     * -----------------------------------------------------*/
    joinAsNew(...paths: Array<string>): Path {
        return new Path(path.join(this._url, ...paths))
    }

    /**--------------------------------------------------------
     * Path join
     * -----------------------------------------------------*/
    join(...paths: Array<string>) {
        this._url = path.join(this._url, ...paths)
    }


    /**---------------------------------------------------------
     * Path split
     * ----------------------------------------------------*/
    split(): Array<Path> {
        const paths = this._url.split(path.sep);
        return paths.map((_path: string, index) => {
            const directories = paths.slice(0, index);
            return new Path(path.join(path.sep, ...directories))
        });
    }

    /**/
    allDir(dirName: string): Array<Path> {
        const paths = this.split();
        return paths.map((filePath: Path) => {
            filePath.join(dirName);
            if (filePath.isDirectory()) {
                return filePath;
            }
        }).filter((filePath) => {
            return (filePath !== undefined);
        })
    }
}



class FileX {
    private root: Path;

    get path(): Path {
        return this._path;
    }

    name: string = "";

    destination: Path;

    require: string = "";

    data: string = "";

    private _path: Path;

    /**
     * fileX Constructor
     * @param url
     * @param resolvesTo
     * @param variableName
     * @param require
     */
    constructor(url: string, resolvesTo: Path, variableName: string, require: string) {
        this._path = new Path(url);
        this.destination = resolvesTo;
        this._path.resolve(this.destination);
        this.require = require;
        this.name = variableName;
    }


    /**
     * fileX path
     * @param path_
     */

    set path(path_: Path) {
        this._path = path_;
        if (path_.url.slice(0, 2).match(/(.){0,2}\//g)) {
            if (!this.resolvesAsFile()) this.resolvesAsDirectory();
        } else {
            this.resolvesAsNodeModule()
        }
    }


    /**
     * fileX resolves as file
     * @return {boolean}
     */

    resolvesAsFile() {
        if (this._path.setExt("js", true)) {
            // return this.resolveData();
            return
        } else if (this._path.setExt("json", true)) {
            // return this.resolveData();
            return
        } else if (this._path.setExt("node", true)) {
            // return this.resolveData();
            return
        }
        return false;
    }


    /**
     * File X resolve node modules
     * Use this when sure that the path is a module
     * */

    private resolvesAsNodeModule() {
        let moduleName = this._path;
        const moduleDirs: Array<Path> = this.root.allDir(`node_modules${path.sep + moduleName}`);
        if (moduleDirs) {
            let index = 0;
            let resolved = false;
            while (!resolved || index < moduleDirs.length) {
                this._path = moduleDirs[index];
                resolved = this.resolvesAsDirectory();
                index++
            }
        } else {
            throw Error("Seems there is trouble finding module " + moduleName + " does not exist");
        }
    }


    /**
     * FileX resolves as Directory
     * @return {undefined|boolean}
     */
    private resolvesAsDirectory(): boolean {
        //TODO be careful
        let packageFilePath: Path = this._path.joinAsNew("package.json");
        if (packageFilePath.isFile()) {
            let _package = JSON.parse(packageFilePath.url);
            let main: string = _package.main;
            this._path.join(main);
        } else {
            this._path.join("index");
        }
        return this.resolvesAsFile();
    }
}


//noinspection JSUnusedGlobalSymbols
export class Clean {
    private options;
    private rawFile;
    private files: Array<FileX>;
    private dirNames;
    private clanFile;
    private regex;

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
        this.files.push(new FileX(
            this.rawFile,
            new Path("_base/777/@/2077647r54363"),
            "base",
            ""
        ));

        this.mapTree();
        this.parseModuleTree();
    }


    /**
     * Maps the whole file finds all require statements and creates
     * an optimal map of file-dependant linked list
     */
    mapTree() {
        for (let ii = 0; ii < this.files.length; ii++) {
            let file: FileX = this.files[ii];
            let data = fs.readFileSync(file.path.url, "utf-8");
            if (file.data) {
                this.files[file.data].data = ""
            }
            file.data = data;
            let matchGroup: Array<string>;
            while ((matchGroup = this.regex.exec(data)) !== null) {
                let fileX: FileX = new FileX(
                    matchGroup[6],
                    file.path,
                    matchGroup[3],
                    matchGroup[0]
                );

                for (let i in this.files) {
                    if (this.files.hasOwnProperty(i)) {
                        let fileY: FileX = this.files[i];
                        if (fileY.path === fileX.path) {
                            fileX.data = i;
                            break;
                        }
                    }
                } //265 991 253519

                this.files.push(fileX)
            }
        }

        this.files.reverse()
    }

    /**
     * Parses the linked list created by Perfect.mapTree() and
     * finally flattens the file into a single clean file
     */
    parseModuleTree() {
        for (let i = 0; i < this.files.length; i++) {
            let fileX: FileX = this.files[i];
            if (fileX.destination.is("_base/777/@/2077647r54363")) {
                fs.writeFileSync(this.clanFile, fileX.data, {encoding: "utf-8", mode: 0o666, flag: 'w'});
                return
            } else {
                let destination;
                for (let i in this.files) {
                    if (this.files.hasOwnProperty(i)) {
                        let fileY: FileX = this.files[i];
                        if (fileY.path === fileX.destination) {
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
        console.log("");
        console.log("-".repeat(100));
        let title = "watching and perfecting";
        console.log(pad(100, title.toLocaleUpperCase(), 2, "-", "-"));
        console.log("-".repeat(100));
        this.files.forEach((file: FileX, index) => {
            let dirName = file.path.directory().name;
            if (!this.dirNames.includes(dirName)) {
                let relPath = `(${index}). ` + path.relative(".", dirName);
                console.log(`${relPath + ".".repeat(100 - relPath.length)}`);
                this.dirNames.push(dirName);
            }
        });
        console.log("-".repeat(100), "\n\n");

        this.dirNames.forEach((dirName) => {
            fs.watch(dirName, {encoding: "utf-8"}, (eventType, filename: string) => {
                if (filename && path.extname(filename) === ".js" && filename !== path.basename(this.clanFile)) {
                    let d = new Date();
                    let h = (d.getHours() > 10) ? d.getHours() : "0" + d.getHours();
                    let m = (d.getMinutes() > 10) ? d.getMinutes() : "0" + d.getMinutes();
                    console.log(`${pad(20, filename, 2, "-")} `,
                        ` ${eventType}ed @ ${h}:${m}:${d.getSeconds()}:${d.getMilliseconds()}`,
                        ` perfected `, this.clanFile);
                    new Clean(this.rawFile, this.clanFile, this.options)
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




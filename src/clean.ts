/**-------------------------------------------------------------------------------------------
 * Author  : Shadrack
 * Date    : 28/11/16.
 * Name    : CleanJS
 * Version : 1.0.1
 * Purpose : Cleans and include all require(files) in one single file js file
 *------------------------------------------------------------------------------------------*/

"use strict";
/**----------------------------------------------------------------------------------------
 * Clean JS dependencies
 * --------------------------------------------------------------------------------------*/
import fs = require('fs')
import path = require('path')
import {pad} from "./cli"
import {FileX, Reference} from "./filex"

type Length = number
type Path = string;
type DirPath = string;

//TODO parseModule modules require from npm ^2
/**----------------------------------------------------------------------------------------
 * Clean class is Object class that has
 * all necessary methods and algorithms for mapping parsing and optimizing
 * a given module to a parseModule single file
 * ---------------------------------------------------------------------------------*/
export class Clean {

    /** -----------------------------------------------------
     * Clean JS Files
     *  --------------------------------------------------*/
    private files: Array<FileX>;


    /** --------------------------------------------------
     * Clean Js Regular expression for require
     *  ------------------------------------------------*/
    private regex: RegExp;


    /** --------------------------------------------------
     * Clean Js Current fileX
     * --------------------------------------------------*/
    private current: FileX;


    /** --------------------------------------------------
     * Clean Js Options
     * -------------------------------------------------*/
    private options;


    /** --------------------------------------------------
     * Clean Js base File
     * @return {FileX}
     *  ------------------------------------------------*/
    private baseFile = (): FileX => {
        return this.files[this.len() - 1]
    };

    /** --------------------------------------------------
     * Clean Js top base path
     * -------------------------------------------------*/
    private topBasePath;

    /**--------------------------------------------------
     * Clean File
     * -------------------------------------------------*/
    private cleanFile;

    /**----------------------------------------------------------
     * Number of all Files in the linked list of this map Object
     * --------------------------------------------------------*/
    private len: Function = (): Length => {
        return this.files.length;
    };


    /**-------------------------------------------------------------
     * Clean JS Constructor
     * @param from : string Path of the entry file to a module file
     * @param to : string
     * @param options
     *-----------------------------------------------------------*/
    constructor(from, to, options = {removeSourceMapComment: true, optimizeStrictMode: true}) {
        this.options = options;
        this.topBasePath = path.resolve(from);
        this.cleanFile = path.resolve(to);
        this.regex = /((const|let|var)\s*(\w+)\s*=)*\s*(\(?\s*new)?\s*require\s*\(\s*["']((\.{0,2}\/?\w+)+)+['"]\s*\)\s*((\.?\/?\w+)+(\(.*\)*)*)*;?/gi;
        this.files = [new FileX("-base|7777|@/201020", "", "base", this.topBasePath, this.topBasePath)];
        this.parseModule();
        this.resolveFile();
        this.finalize();
    }

    /** -------------------------------------------------------
     * An array of all unique directory names of the path urls
     *  -------------------------------------------------- */
    dirNames(): Array<DirPath> {
        return this.files.map((file: FileX) => {
            return file.url;
        }).map((pathUrl: Path) => {
            return path.dirname(pathUrl);
        })
    }


    /** -------------------------------------------------------------------
     * Maps the whole file finds all require statements and creates
     * an optimal map of file-dependant linked list
     *
     * Appends next root fileX to the files map during mapping
     * Its gets all necessary info from the current file's data content
     *
     * m = module
     * m[0] require,
     * m[3] name
     * m[6] path
     * ------------------------------------------------------------*/


    parseModule() {

        /**proposal 0.2.1
         * loop through all files incrementally push data to the files array dynamically
         * The push is done dynamically because at the beginning there is no knowledge
         * of how many files there in the whole module, it is discovery parsing.
         *
         * For each file let fileX resolve the current file of dependencies
         * And return
         * */

        for (let i: Reference = 0; i < this.len(); i++) {
            const current: FileX = this.files[i];
            const filename = current.url.split("/").pop();
            console.log(" ===== Parsing file no." + i + " ====== " + filename, "\n");
            let m;
            let modules: Array<FileX> = [];
            while ((m = this.regex.exec(current.data)) !== null) {
                let require = m[0];
                let name = m[3];
                let newWrap = m[4];
                let url = m[5];
                let requireName = m[6];
                let objectImported = m[7];
                let fileX: FileX = new FileX(current.url, require, name, url, this.topBasePath);

                fileX.addRequireName(requireName);
                fileX.addNewRap(newWrap);
                fileX.addIdentifier(objectImported);
                modules.push(fileX);
            }

            modules.reverse();
            this.files = this.files.concat(modules)
        }
        this.files.reverse();
    }


    /**--------------------------------------------------------------
     * Parses the linked list created by Perfect.parseModule() and
     * finally flattens the file into a single parseModule file
     * -------------------------------------------------------------*/
    resolveFile() {

        for (let i = 0; i < this.len(); i++) {
            let file: FileX = this.files[i];
            file.reference = i;
            let destination: FileX = this.destination(file);
            if (file && file.name !== "base") {

                file.hasDuplicate(this.files);

                if (this.options.optimizeStrictMode) {
                    file.data = file.data.replace(/"use strict";/g, "");
                }
                if (file.isDuplicate()) {
                    file.data = ""
                }

                if (file.new_wrap || file.identifier) {
                    console.log("use special replace")
                } else {
                    destination.data = destination.data.replace(
                        file.require, file.data
                    );

                    destination.data = destination.data.replace(
                        new RegExp(`${file.name}.`, 'g'), ""
                    );

                    destination.data = destination.data.replace(
                        /(exports.\w+\s*=\s*\w+\s*;)/g, ""
                    );
                }

                if (this.options.removeSourceMapComment) {
                    destination.data = destination.data.replace(
                        /(\/\/#\s*sourceMappingURL=\w*.js.map)/g, ''
                    );
                }
            }
        }
    }

    /**------------------------------------------------------------
     * Clean JS destination file
     * @param file where this filX is required
     * @return {FileX}
     *--------------------------------------------------------*/
    destination(file: FileX): FileX {
        for (let i = file.reference + 1; i < this.files.length; i++) {
            if (this.files[i].url === file.destination) {
                return this.files[i];
            }
        }
    }

    /**---------------------------------------------------------------
     * Clean Js  Finalize
     * Checks for completeness then writes all parseModule content
     * to the parseModule file  provided in the to path
     *-------------------------------------------------------------*/
    finalize() {
        if (!this.baseFile().data.match(this.regex)) {
            fs.writeFileSync(
                this.cleanFile,
                this.baseFile().data,
                {encoding: "utf-8", mode: 0o666, flag: 'w'})
            ;
        } else {
            throw new Error(
                "This file is not parsed/ resolved, report this issue for fix"
            );
        }
    }

    //noinspection JSUnusedGlobalSymbols
    /**--------------------------------------------------------------
     * Watches all the files of the dependency files and ushers in
     * a new perfection each time any of the raw dependency files
     * changes
     *-----------------------------------------------------------*/
    watch() {
        let dirNames = this.dirNames();

        console.log("-".repeat(100));
        let title = "watching and perfecting";
        console.log(pad(100, title.toUpperCase(), 2, "-", "-"));
        console.log("-".repeat(100));

        dirNames.forEach((dirName, index) => {
            let relPath = `(${index}). ` + path.relative(".", dirName);
            console.log(`${relPath + ".".repeat(100 - relPath.length)}`);

            fs.watch(dirName, {encoding: "utf-8"}, (eventType, filename: string) => {
                if (filename && path.extname(filename) === ".js" && filename !== path.basename(this.cleanFile)) {
                    let d = new Date();
                    let h = (d.getHours() < 10) ? d.getHours() : "0" + d.getHours();
                    let m = (d.getMinutes() < 10) ? d.getMinutes() : "0" + d.getMinutes();
                    console.log(`${pad(20, filename, 2, "-")} `,
                        ` ${eventType}ed @ ${h}:${m}:${d.getSeconds()}:${d.getMilliseconds()}`,
                        ` perfected `, this.cleanFile);
                    new Clean(this.topBasePath, this.cleanFile, this.options)
                }

            });
        });
        console.log("-".repeat(100), "\n\n");
        this.exit();
    }

    /**------------------------------------------------------------
     * Clean exit method is called when parseModule js
     * process is interrupted by a SIGINT exit command
     * ----------------------------------------------------------*/
    private exit() {
        if (process.platform === "win32") {
            let rl = require("readline").createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.on("SIGINT", () => {
                process.emit("SIGINT");
            });
        }

        process.on("SIGINT", () => {
            process.exit();
        });
    }
}




/**
 * Created by shadrack on 20/12/16.
 */

class Char {
    private value: string;

    constructor(char: string|number) {
        if (typeof  char === "string") {
            this.value = char;
        } else {
            this.value = String.fromCharCode(char)
        }
    }

    racter(): string {
        return this.value
    }
}

class Characters extends Array<Char> {
    constructor() {
        super()
    }
}
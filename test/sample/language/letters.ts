/**
 * Created by shadrack on 20/12/16.
 */
class Letter extends Char {
    constructor(char: Char) {
        super(char.racter())
    }
}

class Letters extends Array<Letter> {
    constructor() {
        super()
    }
}
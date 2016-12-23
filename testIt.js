/**
 * Created by shadrack on 21/12/16.
 */
const name = ["John", "Jude", "henamiah", "Charles"];
const name_with_d = name.map((name_) => {
    "use strict";
    if (name_.includes('d')) {
        return name_ + "name";
    }
}).filter((name_) => {
    "use strict";
    return (name_ !== undefined)
});
let count = 0;
function namex(name) {

    while (count < name.length) {
        "use strict";
        if (name[count]) {
            return "name is goood"
        }
        count++
    }
}
const some_name = namex(name);

console.log(name_with_d, some_name, count);
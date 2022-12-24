const fs = require("fs");
const config = require("../config");

class Files {

    removeFile(filename) {
        try {
            fs.unlinkSync(config.FILE_PATH + filename);
        } catch (err) {
            console.error("Remove File ERR", err.message);
        }
    }

}

module.exports = Files;
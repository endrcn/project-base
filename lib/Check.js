const Error = require("./Error");
const Enum = require("../config/Enum");

let instance = null;

//Singleton
class Check {

    constructor() {
        if (!instance) instance = this;
        return instance;
    }

    /**
     * Checks the at least one arg in args is empty.
     * @param {String[]} args
     */
    isEmpty(...args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i] == undefined || args[i] == null || args[i] === "")
                return true;
        }
        return false;
    }

    isNumeric(text) {
        if (/^[0-9]+$/.test(text))
            return true;
        return false;
    }

    /**
     * Checks the str is a JSON
     * @param {String} str 
     */
    isJSON(str) {
        try {
            let json = JSON.parse(str);
            return json;
        } catch (e) {
            return null;
        }
    }

    /**
     * Checks whether the mustNecessaryFields fields are in the dataObject
     * @param {Object} dataObject 
     * @param {String[]} mustNecessaryFields 
     */
    areThereEmptyFields(dataObject, ...mustNecessaryFields) {
        let emptyFields = [];
        for (let i = 0; i < mustNecessaryFields.length; i++) {
            if (!dataObject.hasOwnProperty(mustNecessaryFields[i]) || this.isEmpty(dataObject[mustNecessaryFields[i]])) {
                emptyFields.push(mustNecessaryFields[i]);
            }
        }
        if (emptyFields.length > 1)
            throw new Error(Enum.HTTP_CODES.BAD_REQUEST, "Validation Failed", `${emptyFields.join(",")} fields are required`);
        if (emptyFields.length > 0)
            throw new Error(Enum.HTTP_CODES.BAD_REQUEST, "Validation Failed", `${emptyFields[0]} field is required`);

        return null;
    }

    isDate(date) {
        var rgx = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})(\s*(?:2[0-3]|[1][0-9]|0?[0-9]):(?:[1-5][1-9]|0?[0-9]))?$/;
        return !this.isEmpty(date) && rgx.test(date);
    }

    equalsTo(word, values) {
        return values.indexOf(word) >= 0;
    }

    getClientIp(req) {
        var ipAddress;
        // The request may be forwarded from local web server.
        var forwardedIpsStr = req.header('x-forwarded-for');
        if (forwardedIpsStr) {
            // 'x-forwarded-for' header may return multiple IP addresses in
            // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
            // the first one
            var forwardedIps = forwardedIpsStr.split(',');
            ipAddress = forwardedIps[0];
        }
        if (!ipAddress) {
            // If request was not forwarded
            ipAddress = req.connection.remoteAddress;
        }
        return ipAddress;
    }

    isIP(text) {
        return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/.test(text);
    }

    checkUserLevel(approvalLevel, userLevels = []) {
        for (let i = 0; i < userLevels.length; i++) {
            if (approvalLevel == userLevels[i] - 1) return true;
        }

        return false;
    }

}

module.exports = Check;
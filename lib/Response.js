const CustomError = require("./Error");
const Enum = require("../config/Enum");

let instance = null;

// Singleton
class Response {
    constructor() {
        if (!instance) instance = this;
        return instance;
    }

    generateResponse(data = [], statusCode = Enum.HTTP_CODES.OK) {
        return {
            code: statusCode,
            data: data
        }
    }

    generateError(errObj) {
        console.error(errObj);
        if (errObj instanceof CustomError) {
            return {
                code: errObj.code,
                error: {
                    message: errObj.message,
                    description: errObj.description
                }
            }
        } else if ((errObj.message || "").includes("E11000 duplicate")) {
            return {
                code: Enum.HTTP_CODES.NOT_ACCEPTABLE,
                error: {
                    message: "Already Exists",
                    description: "Already Exists"
                }
            }
        }

        return {
            code: Enum.HTTP_CODES.INT_SERVER_ERROR,
            error: {
                message: "Server Error",
                description: "Server is temporarily unavailable, please try again later."
            }
        }
    }
}

module.exports = Response;
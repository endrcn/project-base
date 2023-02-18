module.exports = {
    PORT: process.env.PORT || 3000,
    DB: {
        CONNECTION_STRING: process.env.CONNECTION_STRING || "mongodb://localhost:27017/project_base",
    },
    TOKEN_EXPIRE_TIME: !isNaN(parseInt(process.env.TOKEN_EXPIRE_TIME)) ? parseInt(process.env.TOKEN_EXPIRE_TIME) : 60 * 60 * 24, // minutes
    JWT: {
        SECRET: process.env.JWT_SECRET,
        SESSION: {
            session: false
        }
    },
    LANG: process.env.SYSTEM_LANG || "en",
    LOGS: {
        TRANSPORT: process.env.LOG_TRANSPORT || "DB",
        LOG_LEVEL: process.env.LOG_LEVEL || "info",
        MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || "50m", // log file size
        MAX_FILES: process.env.LOG_MAX_FILES || "14d" // the number of days the logs will be stored
    }
};
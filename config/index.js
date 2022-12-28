module.exports = {
    PORT: process.env.PORT || 3000,
    DB: {
        TYPE: process.env.DB_TYPE || "mssql",
        DB_NAME: process.env.DB_NAME,
        USER: process.env.DB_USER,
        PASS: process.env.DB_PASS,
        HOST: process.env.DB_HOST,
        DOMAIN: process.env.DOMAIN,
        PORT: !isNaN(parseInt(process.env.DB_PORT)) ? parseInt(process.env.DB_PORT) : 1433
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
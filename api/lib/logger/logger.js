//const { createLogger, format, transports } = require("winston");

const { transports, createLogger, format } = require('winston');
var config = require("../../config/index")
const { TRANSPORT } = require("../../config/Enum.js");
require('winston-daily-rotate-file');

let transports_list = []
//console.log("T type , ", config.LOGS.TRANSPORT)
const formats = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  format.simple(),
  format.splat(),
  format.printf(info => (config.LOGS.LOG_FORMAT == "JSON") ? `[${info.timestamp}] ${info.level.toUpperCase()}: ${JSON.stringify(info.message)}` : `${info.timestamp} ${info.level.toUpperCase()}: [userid:${info.message.userId}] [client:${info.message.client}] [location:${info.message.location}] [procType:${info.message.procType}] [log:${info.message.log}] [processId:${info.message.processId}]`),
  // format.prettyPrint(),
  // format.colorize({ all: true }),
);

if (config.LOGS.TRANSPORT == TRANSPORT.FILE) {
  console.log("Logs will be printed to File")
  let transport = new (transports.DailyRotateFile)({
    format: formats,
    filename: config.PATHS.LOG_PATH + 'app-%DATE%.log',
    datePattern: 'DD-MM-YYYY',
    zippedArchive: true,
    maxSize: '50m',//k,m,g birimler kb,mb,gb için yanina eklenir.
    maxFiles: '14d'//gün kullaniliyorsa sonuna d eklenir.Saklanacak max. gün sayisi,ayarlanmazsa log kaldirilmaz.
  });
  transports_list.push(transport)
} else {
  console.log("Logs will be printed to console")
  let transport = new (transports.Console)({
    format: formats,
    // colorize: true
  });
  transports_list.push(transport)
}
console.log("LOG LEVEL ", config.LOGS.LEVEL)
//console.log("Transports" , transports_list)
var logger = createLogger({
  level: config.LOGS.LEVEL,
  transports: transports_list,
});

module.exports = logger;

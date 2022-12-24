
/**
 * MongoDB methods are in this class
 * This class is created with Singleton Pattern!
 */

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const config = require("../config");

const UserModel = require("./models/Users");
const RoleModel = require("./models/Roles");
const RolePrivilegeModel = require("./models/RolePrivileges");
const UserRoles = require("./models/UserRoles");
const Categories = require("./models/Categories");
const AuditLogs = require("./models/AuditLogs");

let instance = null;

const operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $nin: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $regex: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col
};

class Database {
    constructor() {
        if (!instance) {
            this.sequelizeConnection = null;
            instance = this;
        }
        return instance;
    }

    async connect(options, next, params = {}) {
        if (!next) next = () => { }
        var seqconfig = {
            host: options.HOST,
            port: options.PORT,
            dialect: options.TYPE,
            operatorsAliases: operatorsAliases,
            logging: false,
            "dialectOptions": {
                options: { "requestTimeout": config.DB_REQUEST_TIMEOUT }
            }
            // query: {
            //     raw: true
            // },
            // define: {
            //     freezeTableName: true
            // }
        }

        let sequelize = null;

        if (options.TYPE.toLocaleLowerCase() === "mssql" && options.hasOwnProperty("DOMAIN") && options.DOMAIN) {
            seqconfig.dialectOptions = {
                authentication: {
                    type: 'ntlm',
                    options: {
                        domain: options.DOMAIN,
                        userName: options.USER,
                        password: options.PASS
                    }
                },
                options: {
                    requestTimeout: config.DB_REQUEST_TIMEOUT
                }
            }
            sequelize = new Sequelize(options.DB_NAME, null, null, seqconfig);
        } else {
            sequelize = new Sequelize(options.DB_NAME, options.USER, options.PASS, seqconfig);
        }



        console.log(options.TYPE, "Connecting!");
        sequelize
            .authenticate()
            .then(() => {
                this.sequelizeConnection = sequelize;
                console.log(options.TYPE, "Connection Established!");
                this.initialModels(sequelize, () => {
                    next(true);
                }, params);
            })
            .catch(err => {
                console.error('Unable to connect to the database:', err);
                throw err;
            });

    }

    checkConnection() {
        this.sequelizeConnection.authenticate()
            .then(() => { }).catch(err => { console.error("CONN ERR", err.message); });
    }

    async initialModels(sequelize) {
        try {
            await UserModel.init(sequelize, Sequelize).sync();
            await RoleModel.init(sequelize, Sequelize).sync();
            await RolePrivilegeModel.init(sequelize, Sequelize).sync();
            await UserRoles.init(sequelize, Sequelize).sync();
            await Categories.init(sequelize, Sequelize).sync();
            await AuditLogs.init(sequelize, Sequelize).sync();
            console.log("All tables are created/altered");
        } catch (err) {
            console.error("Table creation error", err);
        }

    }

}


module.exports = new Database();
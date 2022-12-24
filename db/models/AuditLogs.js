const Sequelize = require("sequelize");
const { v4: uuid } = require("uuid");

class AuditLogs extends Sequelize.Model {

    constructor(fields) {
        super();
        this.dataValues = fields;

    }

    static init(sequelize, DataTypes) {
        AuditLogs.db = super.init(
            {
                _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                level: { type: DataTypes.STRING, allowNull: false },
                email: { type: DataTypes.STRING, allowNull: false },
                location: { type: DataTypes.STRING, allowNull: false },
                proc_type: { type: DataTypes.STRING, allowNull: false },
                log: { type: DataTypes.TEXT }
            },
            {
                modelName: "AuditLogs",
                sequelize
            }
        );


        return AuditLogs.db;
    }

    async save() {

        if (!this.dataValues._id) {
            this.dataValues._id = uuid();
        }

        await super.save();
    }

    static async remove(query) {
        await super.destroy({ where: query });
    }

}

module.exports = AuditLogs.db || AuditLogs;
const Sequelize = require("sequelize");
const UserModel = require("./Users")
const RoleModel = require("./Roles");
const { v4: uuid } = require("uuid");

class RolePrivileges extends Sequelize.Model {

    constructor(fields) {
        super();
        this.dataValues = fields;

    }

    static init(sequelize, DataTypes) {
        RolePrivileges.db = super.init(
            {
                _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                role_id: { type: DataTypes.UUID, allowNull: false },
                permission: { type: DataTypes.STRING, allowNull: false },
                created_by: { type: DataTypes.UUID, allowNull: false }
            },
            {
                indexes: [
                    {
                        unique: true,
                        fields: ['role_id', 'permission']
                    }
                ],
                modelName: "RolePrivileges",
                sequelize
            }
        );

        RolePrivileges.belongsTo(UserModel, { foreignKey: "created_by" });
        RolePrivileges.belongsTo(RoleModel, { foreignKey: "role_id" });


        return RolePrivileges.db;
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

module.exports = RolePrivileges.db || RolePrivileges;
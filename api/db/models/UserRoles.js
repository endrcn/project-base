const Sequelize = require("sequelize");
const UserModel = require("./Users");
const { v4: uuid } = require("uuid");
const Roles = require("./Roles");

class UserRoles extends Sequelize.Model {

    constructor(fields) {
        super();
        this.dataValues = fields;

    }

    static init(sequelize, DataTypes) {
        UserRoles.db = super.init(
            {
                _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                role_id: { type: DataTypes.UUID },
                user_id: { type: DataTypes.UUID },
                created_by: { type: DataTypes.UUID, allowNull: false },
                updated_by: { type: DataTypes.UUID }
            },
            {
                indexes: [
                    {
                        unique: true,
                        fields: ['role_id', 'user_id']
                    }
                ],
                modelName: "UserRoles",
                sequelize
            }
        );

        UserRoles.belongsTo(UserModel, { foreignKey: "created_by", targetKey: "_id" });
        UserRoles.belongsTo(UserModel, { foreignKey: "user_id", targetKey: "_id" });
        UserRoles.belongsTo(Roles, { foreignKey: "role_id", targetKey: "_id" });

        return UserRoles.db;
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

module.exports = UserRoles.db || UserRoles;
const Sequelize = require("sequelize");
const UserModel = require("./Users");
const { v4: uuid } = require("uuid");

class Roles extends Sequelize.Model {

    constructor(fields) {
        super();
        this.dataValues = fields;

    }

    static init(sequelize, DataTypes) {
        Roles.db = super.init(
            {
                _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                role_name: { type: DataTypes.STRING, allowNull: false },
                description: { type: DataTypes.TEXT },
                is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
                created_by: { type: DataTypes.UUID, allowNull: false },
                updated_by: { type: DataTypes.UUID }
            },
            {
                indexes: [
                    {
                        unique: true,
                        fields: ['role_name']
                    }
                ],
                modelName: "Roles",
                sequelize
            }
        );

        Roles.belongsTo(UserModel, { foreignKey: "created_by", targetKey: "_id" });

        return Roles.db;
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

module.exports = Roles.db || Roles;
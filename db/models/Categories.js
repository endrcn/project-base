const Sequelize = require("sequelize");
const UserModel = require("./Users");
const { v4: uuid } = require("uuid");

class Categories extends Sequelize.Model {

    constructor(fields) {
        super();
        this.dataValues = fields;

    }

    static init(sequelize, DataTypes) {
        Categories.db = super.init(
            {
                _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                title: { type: DataTypes.STRING, allowNull: false },
                created_by: { type: DataTypes.UUID, allowNull: false },
                updated_by: { type: DataTypes.UUID },
                is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
            },
            {
                modelName: "Categories",
                sequelize
            }
        );

        Categories.belongsTo(UserModel, { foreignKey: "created_by", targetKey: "_id" });

        return Categories.db;
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

module.exports = Categories.db || Categories;
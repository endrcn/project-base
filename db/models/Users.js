const bcrypt = require("bcrypt-nodejs");
const Sequelize = require("sequelize");
const is = require("is_js");
const { v4: uuid } = require("uuid");

const Enum = require("../../config/Enum");


class Users extends Sequelize.Model {

    constructor(fields) {
        super();
        this.dataValues = fields;

    }

    static init(sequelize, DataTypes) {
        Users.db = super.init(
            {
                _id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
                email: { type: DataTypes.STRING, allowNull: false },
                password: { type: DataTypes.STRING, allowNull: false },
                is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
                first_name: { type: DataTypes.STRING, allowNull: false },
                last_name: { type: DataTypes.STRING, allowNull: false },
                phone_number: { type: DataTypes.STRING },
                created_by: { type: DataTypes.UUID },
                updated_by: { type: DataTypes.UUID },
                language: { type: DataTypes.STRING, defaultValue: "en" }
            },
            {
                indexes: [
                    {
                        unique: true,
                        fields: ['email']
                    }
                ],
                modelName: "Users",
                sequelize
            }
        );
        return Users.db;
    }

    static generateHash(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    }

    validPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }

    /**
 * Validates the user object's fields.
 * If detect an Error, throw the Error!
 * @param {String} email User Email
 * @param {String} password User password
 */
    static validateFieldsBeforeAuth(email, password) {
        if (typeof password !== "string" || password.length < Enum.PASS_LENGTH || is.not.email(email))
            throw new Error(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Failed", "Username or password is wrong!");

        return null;
    }

    async save() {
        if (!is.email(this.dataValues.email))
            throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, "Validation Failed", "Email field is not an email")

        //Password checking.
        if (typeof this.dataValues.password !== "string" || this.dataValues.password.length < Enum.PASS_LENGTH)
            throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, "Validation Failed", `Password field length must be greater than ${Enum.PASS_LENGTH}`);

        //first_name, last_name checking.
        if ((!this.dataValues.first_name || !this.dataValues.last_name) || is.any.empty(this.dataValues.first_name, this.dataValues.last_name))
            throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, Enum.HTTP_CODES, "first_name and last_name fields are required");

        if (!this.dataValues._id) {
            this.dataValues._id = uuid();
        }

        await super.save();
    }

    static async count(query = {}) {
        try {
            return await super.count({ where: query });
        } catch (err) {
            console.error(err);
        }
    }

    static async remove(query) {
        await super.destroy({ where: query });
    }

}

module.exports = Users.db || Users;
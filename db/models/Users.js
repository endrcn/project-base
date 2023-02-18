const bcrypt = require("bcrypt-nodejs");
const mongoose = require("mongoose");
const is = require("is_js");

const Enum = require("../../config/Enum");
const Error = require("../../lib/Error");

const schema = mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    is_active: { type: mongoose.Schema.Types.Boolean, defaultValue: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone_number: { type: String },
    created_by: { type: mongoose.Schema.Types.ObjectId },
    updated_by: { type: mongoose.Schema.Types.ObjectId },
    language: { type: String, defaultValue: "en" }
}, {
    versionKey: false,
    timestamps: true
});

class Users extends mongoose.Model {

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
            throw new Error(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Failed", "Email or password is wrong!");

        return null;
    }

    async save() {
        if (!is.email(this.email))
            throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, "Validation Failed", "Email field is not an email")

        //Password checking.
        if (typeof this.password !== "string" || this.password.length < Enum.PASS_LENGTH)
            throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, "Validation Failed", `Password field length must be greater than ${Enum.PASS_LENGTH}`);

        //first_name, last_name checking.
        if ((!this.first_name || !this.last_name) || is.any.empty(this.first_name, this.last_name))
            throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, Enum.HTTP_CODES, "first_name and last_name fields are required");

        await super.save();
    }

}

schema.loadClass(Users);
module.exports = mongoose.model("users", schema, "users");
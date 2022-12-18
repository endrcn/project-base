var express = require('express');
const jwt = require("jwt-simple");
const bcrypt = require("bcrypt-nodejs");

var router = express.Router();

const config = require("../config");
const Enum = require("../config/Enum");
const Response = require("../lib/Response");
const User = require("../db/models/Users");
const Roles = require("../db/models/Roles");
const UserRoles = require("../db/models/UserRoles");
const RolePrivileges = require("../db/models/RolePrivileges");
const i18n = require("../i18n");
const auth = require("../config/auth")();
const check = new (require("../lib/Check"))();
const Error = require("../lib/Error");
const auditLogs = require("../lib/AuditLogs");

router.post("/", auth.authenticate(), auth.checkRole("user_view", "instruction_view", "instruction_view_partial"), async (req, res) => {
  let body = req.body;
  let query = {};
  try {

    if (body.search) {
      query = {
        $or: [
          { email: { $like: "%" + body.search + "%" } },
          { first_name: { $like: "%" + body.search + "%" } },
          { last_name: { $like: "%" + body.search + "%" } }
        ]
      }
    }

    if (typeof body.is_active === "boolean") query.is_active = body.is_active;

    let users = await User.findAll({ where: query, raw: true });
    let userRoles = await UserRoles.findAll({ where: { user_id: { $in: users.map(x => x._id) } } });

    for (let i = 0; i < users.length; i++) {
      let roles = userRoles.filter(x => x.user_id == users[i]._id) || [];
      users[i].password = undefined;
      users[i].role_ids = roles.map(x => x.role_id);
    }

    res.json(new Response().generateResponse(users));

  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
})

router.post("/auth", async (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;


  try {

    User.validateFieldsBeforeAuth(email, pass);

    let users = await User.findAll({ where: { email } });
    if (users.length == 0 || !users[0].is_active) throw new Error(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Failed", "Email or password is wrong.");
    let user = users[0];

    if (!user.validPassword(pass)) throw new Error(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Failed", "Email or password is wrong.");

    let userRoles = (await UserRoles.findAll({ where: { user_id: user._id } })) || [];

    try {
      userRoles = await Roles.findAll({ where: { _id: { $in: userRoles.map(ur => ur.role_id) } } });
      for (let i = 0; i < userRoles.length; i++) {
        userRoles[i].dataValues.privilege = (await RolePrivileges.findAll({ where: { role_id: userRoles[i]._id } }) || []).map(x => {
          return Enum.Privileges.find(p => p.Key == x.permission)
        });
      }
    } catch (error) {
      console.log("Not found any user role", error);
    }

    let payload = {
      id: user._id,
      exp: parseInt(Date.now() / 1000) + config.TOKEN_EXPIRE_TIME
    }

    let token = jwt.encode(payload, config.JWT.SECRET);

    let userData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: userRoles
    }

    res.status(Enum.HTTP_CODES.OK).json(new Response().generateResponse({ token: token, user: userData }));
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code).json(response);
  }
});

/**
 * User Register Controller
 * body: {
 *  email: "",
 *  password: "", // >= 8 chars.
 *  first_name: "",
 *  last_name: ""
 * }
 */
router.post("/register", async (req, res) => {
  let data = req.body;
  try {
    if (!data || typeof data !== "object")
      throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.VALIDATION_ERROR_INFO);
    data.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(8), null);

    let superUsers = await User.findAll({ where: { level: 0 } });

    if (superUsers.length > 0) {
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }

    let user = new User({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number || "",
      level: 0,
      is_active: true
    });

    await user.save();

    res.status(Enum.HTTP_CODES.OK).json(new Response().generateResponse(data));

  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }

});

router.post("/add", auth.authenticate(), auth.checkRole("user_add"), async (req, res) => {
  let data = req.body;

  try {

    check.areThereEmptyFields(data, "email", "password", "first_name", "last_name", "role_ids");

    if ((!Array.isArray(data.role_ids) || data.role_ids.length == 0))
      throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.ROLE_MUST_ERROR);

    if (data.password.length < 8)
      throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.PASSWORD_LENGTH_ERROR);
    var re = /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))\s*?/;
    if (!re.test(String(data.email).toLowerCase()))
      throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.EMAIL_VALIDATION_ERROR);

    data.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(8), null);
    let user = new User({
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone_number: data.phone_number || "",
      is_active: true,
      created_by: req.user.id
    });

    await user.save();

    for (let i = 0; i < data.role_ids.length; i++) {
      let role_id = data.role_ids[i];
      let userRole = new UserRoles({
        role_id,
        user_id: user._id,
        created_by: req.user.id
      });

      await userRole.save();

    }

    auditLogs.info(req.user.email, "User", "Add", `${user.email} ${i18n.LOGS.USER_ADD}`);

    res.status(Enum.HTTP_CODES.CREATED).json(new Response().generateResponse({ success: true }));
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }

});

router.post("/update", auth.authenticate(), auth.checkRole("user_update"), async (req, res) => {
  let data = req.body;
  let updates = {};
  try {

    check.areThereEmptyFields(data, "_id");

    let user = await User.findOne({ where: { _id: data._id } });
    if (user) {

      if (!check.isEmpty(data.password) && data.password.length < 8)
        throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.PASSWORD_LENGTH_ERROR);

      //gelen kullanıcının passwordu db deki passworde eşit değilse kullanıcı password guncelliyor.
      if (!check.isEmpty(data.password) && !bcrypt.compareSync(data.password, user.password)) {

        updates.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(8), null);
      } else if (!check.isEmpty(data.password)) {
        updates.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(8), null);
      }

      if (!check.isEmpty(data.role_ids) && data.role_ids.length == 0 && user.level != 0)
        throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.ROLE_MUST_ERROR);
      else {

        let userRoles = await UserRoles.findAll({ where: { user_id: user._id } });

        let role_ids = userRoles.map(x => x._id);

        let removedRoleIds = role_ids.filter(x => !data.role_ids.includes(x));
        let newRoleIds = data.role_ids.filter(x => !role_ids.includes(x));

        if (removedRoleIds.length > 0)
          await UserRoles.remove({ _id: { $in: removedRoleIds } });

        for (let i = 0; i < newRoleIds.length; i++) {
          let role_id = newRoleIds[i];
          let userRole = new UserRoles({
            role_id,
            user_id: user._id,
            created_by: req.user.id
          });

          await userRole.save();

        }

      }

      if (data.first_name) updates.first_name = data.first_name;
      if (data.last_name) updates.last_name = data.last_name;
      if (data.phone_number) updates.phone_number = data.phone_number;
      if (typeof data.is_active === "boolean") updates.is_active = data.is_active;

      updates.updated_by = req.user.id;

      await User.update(updates, { where: { _id: user._id } });

      let updated = await User.findOne({ where: { _id: user._id } });

      updated.password = undefined;

      auditLogs.info(req.user.email, "User", "Update", `${updated.email} ${i18n.LOGS.USER_UPDATE}`);

      res.json(new Response().generateResponse(updated));

    } else {
      throw new Error(Enum.HTTP_CODES.NOT_FOUND, i18n.USERS.USER_NOT_FOUND, i18n.USERS.USER_NOT_FOUND);
    }

  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }


});

router.post("/delete", auth.authenticate(), auth.checkRole("user_delete"), async (req, res) => {
  let data = req.body;

  try {

    check.areThereEmptyFields(data, "id");

    let user = await User.findOne({ where: { _id: data.id } });

    await UserRoles.remove({ user_id: data.id })
    await User.remove({ _id: data.id })

    auditLogs.info(req.user.email, "User", "Delete", `${user.email} ${i18n.LOGS.USER_DELETE}`);

    res.status(Enum.HTTP_CODES.OK).json({ success: true });
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }

});

module.exports = router;

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

router.post("/", auth.authenticate(), auth.checkRole("user_view"), async (req, res) => {
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

    let users = await User.find(query).lean();
    let userRoles = await UserRoles.find({ user_id: { $in: users.map(x => x._id) } });

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

    let users = await User.find({ email });
    if (users.length == 0 || !users[0].is_active) throw new Error(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Failed", "Email or password is wrong.");
    let user = users[0];

    if (!user.validPassword(pass)) throw new Error(Enum.HTTP_CODES.UNAUTHORIZED, "Validation Failed", "Email or password is wrong.");

    let userRoles = (await UserRoles.find({ user_id: user._id })) || [];

    try {
      userRoles = await Roles.find({ _id: { $in: userRoles.map(ur => ur.role_id) } }).lean();
      for (let i = 0; i < userRoles.length; i++) {
        userRoles[i].privilege = (await RolePrivileges.find({ role_id: userRoles[i]._id }) || []).map(x => {
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
  let body = req.body;
  try {
    if (!body || typeof body !== "object")
      throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.VALIDATION_ERROR_INFO);
    body.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let superAdminRole = await Roles.findOne({ role_name: "SUPER_ADMIN" });

    if (superAdminRole && superAdminRole._id) {
      return res.sendStatus(Enum.HTTP_CODES.NOT_FOUND);
    }


    // Create a user
    let user = new User({
      email: body.email,
      password: body.password,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number || "",
      is_active: true
    });

    await user.save();

    // Create a SUPER_ADMIN role
    let role = new Roles({
      role_name: "SUPER_ADMIN",
      is_active: true,
      created_by: user._id
    });

    await role.save();

    // Create Role Privileges
    for (let i = 0; i < Enum.Privileges.length; i++) {
      let priv = new RolePrivileges({
        role_id: role._id,
        permission: Enum.Privileges[i].Key,
        created_by: user._id
      })

      await priv.save();
    }

    // Bind user and role
    let userRole = new UserRoles({
      role_id: role._id,
      user_id: user._id,
      created_by: user._id
    });

    await userRole.save();

    delete body.password;

    res.status(Enum.HTTP_CODES.OK).json(new Response().generateResponse(body));

  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }

});

router.post("/add", auth.authenticate(), auth.checkRole("user_add"), async (req, res) => {
  let body = req.body;

  try {

    check.areThereEmptyFields(body, "email", "password", "first_name", "last_name", "role_ids");

    if ((!Array.isArray(body.role_ids) || body.role_ids.length == 0))
      throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.ROLE_MUST_ERROR);

    if (body.password.length < 8)
      throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.PASSWORD_LENGTH_ERROR);
    if (!check.checkPassword(String(body.email).toLowerCase()))
      throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.EMAIL_VALIDATION_ERROR);

    body.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);

    let roles = await Roles.find({ _id: { $in: body.role_ids } });

    if (roles.length != body.role_ids.length) throw new Error(Enum.HTTP_CODES.NOT_FOUND, i18n.COMMON.VALIDATION_ERROR_TITLE, i18n.COMMON.VALIDATION_ERROR_INFO);

    let user = new User({
      email: body.email,
      password: body.password,
      first_name: body.first_name,
      last_name: body.last_name,
      phone_number: body.phone_number || "",
      is_active: true,
      created_by: req.user.id,
      language: Enum.LANG[body.language] || Enum.LANG.en
    });

    await user.save();

    for (let i = 0; i < body.role_ids.length; i++) {
      let role_id = body.role_ids[i];
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
  let body = req.body;
  let updates = {};
  try {

    check.areThereEmptyFields(body, "id");

    let user = await User.findOne({ _id: body.id });
    if (user) {

      if (!check.isEmpty(body.password) && body.password.length < 8)
        throw new Error(Enum.HTTP_CODES.UNPROCESSIBLE_ENTITY, i18n.USERS.VALIDATION_ERROR_TITLE, i18n.USERS.PASSWORD_LENGTH_ERROR);

      //gelen kullanıcının passwordu db deki passworde eşit değilse kullanıcı password guncelliyor.
      if (!check.isEmpty(body.password) && !bcrypt.compareSync(body.password, user.password)) {

        updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
      } else if (!check.isEmpty(body.password)) {
        updates.password = bcrypt.hashSync(body.password, bcrypt.genSaltSync(8), null);
      }

      if (body.language && Enum.LANG[body.language]) {
        updates.language = body.language;
      }

      if (Array.isArray(body.role_ids) && body.role_ids.length > 0) {

        let userRoles = await UserRoles.find({ user_id: user._id });

        let role_ids = userRoles.map(x => x._id);
        if (role_ids.length > 0) {
          let removedRoleIds = role_ids.filter(x => !body.role_ids.includes(x));
          let newRoleIds = body.role_ids.filter(x => !role_ids.includes(x));

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
      }

      if (body.first_name) updates.first_name = body.first_name;
      if (body.last_name) updates.last_name = body.last_name;
      if (body.phone_number) updates.phone_number = body.phone_number;
      if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

      updates.updated_by = req.user.id;

      await User.updateOne({ _id: user._id }, updates);

      let updated = await User.findOne({ _id: user._id });

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
  let body = req.body;

  try {

    check.areThereEmptyFields(body, "id");

    let user = await User.findOne({ _id: body.id });

    if (user) {
      await UserRoles.remove({ user_id: body.id })
      await User.remove({ _id: body.id })

      auditLogs.info(req.user.email, "User", "Delete", `${user.email} ${i18n.LOGS.USER_DELETE}`);
    }

    return res.status(Enum.HTTP_CODES.OK).json({ success: true });

  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }

});

module.exports = router;

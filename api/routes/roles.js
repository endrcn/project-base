var express = require('express');
var router = express.Router();

const check = new (require("../lib/Check"))();
const Enum = require("../config/Enum");
const Response = require("../lib/Response");
const Error = require("../lib/Error");
const i18n = require("../i18n");
const Roles = require("../db/models/Roles");
const RolePrivileges = require("../db/models/RolePrivileges"); // TODO: Yeri geldiği zaman eklenecek.
const auth = require("../config/auth")();
const auditLogs = require("../lib/AuditLogs");

router.post('*', auth.authenticate(), function (req, res, next) {
  next();
})

router.post("/", auth.checkRole("role_view"), async (req, res) => {
  let body = req.body;
  let query = {};
  try {

    if (body.search) {
      query = {
        $or: [
          { role_name: { $like: "%" + body.search + "%" } },
          { description: { $like: "%" + body.search + "%" } }
        ]
      }
    }

    if (typeof body.is_active === "boolean") query.is_active = body.is_active;

    let roles = await Roles.findAll({ where: query });

    for (let i = 0; i < roles.length; i++) {
      let permissions = await RolePrivileges.findAll({ where: { role_id: roles[i]._id } });
      if (permissions.length > 0) {
        roles[i].dataValues.permissions = permissions.map(x => x.permission);
      } else {
        roles[i].dataValues.permissions = [];
      }
    }

    res.json(new Response().generateResponse(roles));

  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

router.post('/add', auth.checkRole("role_add"), async (req, res) => {
  try {

    let body = req.body;

    check.areThereEmptyFields(body, "role_name", "permissions", "level");

    if (!Array.isArray(body.permissions) || body.permissions.length == 0) {
      throw new Error(Enum.HTTP_CODES.NOT_ACCEPTABLE, i18n.COMMON.VALIDATION_ERROR_TITLE, i18n.ROLES.PERMISSION_VALIDATION_ERROR);
    }

    if (!check.isNumeric(body.level) || body.level < 1) throw new Error(Enum.HTTP_CODES.NOT_ACCEPTABLE, i18n.COMMON.VALIDATION_ERROR_TITLE, i18n.ROLES.LEVEL_VALIDATION_ERROR);

    let role = new Roles({
      role_name: body.role_name,
      description: body.description,
      is_active: true,
      created_by: req.user.id,
      level: body.level
    });

    await role.save();

    for (let i = 0; i < body.permissions.length; i++) {
      let permission = new RolePrivileges({
        role_id: role._id,
        permission: body.permissions[i],
        created_by: req.user.id
      });

      await permission.save();
    }

    auditLogs.info(req.user.email, "Role", "Add", `${role.role_name} ${i18n.LOGS.ROLE_ADD}`);

    return res.status(Enum.HTTP_CODES.CREATED).json(new Response().generateResponse({ success: true }));
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

router.post('/update', auth.checkRole("role_update"), async (req, res) => {
  try {

    let body = req.body;
    let updates = {};

    check.areThereEmptyFields(body, "_id");

    if (body.role_name) updates.role_name = body.role_name;
    if (body.description) updates.description = body.description;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (check.isNumeric(body.level) && body.level >= 1) updates.level = body.level;

    updates.updated_by = req.user.id;

    await Roles.update(updates, { where: { _id: body._id } });

    let updated = (await Roles.findAll({ where: { _id: body._id } }) || [])[0] || {};

    if (Array.isArray(body.permissions) && body.permissions.length > 0) {
      let permissions = await RolePrivileges.findAll({ where: { role_id: body._id } });

      let removedPermissions = permissions.filter(x => !body.permissions.includes(x.permission)).map(x => x._id);
      let newPermissions = body.permissions.filter(x => !permissions.map(x => x.permission).includes(x));

      if (removedPermissions.length > 0)
        await RolePrivileges.remove({ _id: { $in: removedPermissions } });

      for (let i = 0; i < newPermissions.length; i++) {
        let permission = newPermissions[i];
        let userRole = new RolePrivileges({
          role_id: body._id,
          permission,
          created_by: req.user.id
        });

        await userRole.save();

      }

    }

    auditLogs.info(req.user.email, "Role", "Update", `${updated.role_name} ${i18n.LOGS.ROLE_UPDATE}`);

    res.json(new Response().generateResponse(updated));
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});


router.post('/delete', auth.checkRole("role_delete"), async (req, res) => {
  try {

    let body = req.body;

    check.areThereEmptyFields(body, "id");

    let updated = (await Roles.findAll({ where: { _id: body.id } }) || [])[0] || {};

    await RolePrivileges.remove({ role_id: body.id });

    await Roles.remove({ _id: body.id });

    auditLogs.info(req.user.email, "Role", "Delete", `${updated.role_name} ${i18n.LOGS.ROLE_DELETE}`);

    return res.status(Enum.HTTP_CODES.OK).json({ success: true });
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

router.post("/privileges", auth.checkRole("role_view"), async (req, res) => {
  res.json(new Response().generateResponse(Enum.Privileges));
});

router.post("/privileges/groups", auth.checkRole("role_view"), async (req, res) => {
  res.json(new Response().generateResponse(Enum.privGroups));
});

module.exports = router;

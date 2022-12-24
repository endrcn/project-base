var express = require('express');
const fs = require("fs");
const Enum = require('../config/Enum');
var router = express.Router();

const Categories = require("../db/models/Categories");
const check = new (require('../lib/Check'))();
const Response = require('../lib/Response');
const auth = require("../config/auth")();
const auditLogs = require("../lib/AuditLogs");
const i18n = require("../i18n");

router.post('*', auth.authenticate(), function (req, res, next) {
  next();
})

router.post('/', auth.checkRole("category_view"), async (req, res) => {
  try {

    let body = req.body;
    let query = {};

    if (typeof body.is_active === "boolean") query.is_active = body.is_active;

    let categories = await Categories.findAll({ where: query });

    return res.json(new Response().generateResponse(categories));
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

router.post('/brokerages', auth.checkRole("category_view"), async (req, res) => {
  try {

    let body = req.body;
    let query = {};

    if (typeof body.is_active === "boolean") query.is_active = body.is_active;

    fs.readFile("./data/brokerage_firms.json", "UTF-8", (err, data) => {
      try {
        if (err) {
          console.error(err);
        } else {
          data = JSON.parse(data);
        }
      } catch (err) {
        console.error(err);
      }

      return res.json(new Response().generateResponse(data));

    })

  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

router.post('/add', auth.checkRole("category_add"), async (req, res) => {
  try {

    let body = req.body;

    check.areThereEmptyFields(body, "title");

    let category = new Categories({
      title: body.title,
      type: body.type,
      select_brokerage: body.select_brokerage,
      created_by: req.user.id,
      is_active: true
    })

    await category.save();

    auditLogs.info(req.user.email, "Category", "Add", `${category.title} ${i18n.LOGS.CATEGORY_ADD}`);

    return res.status(Enum.HTTP_CODES.CREATED).json(new Response().generateResponse({ success: true }))
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

router.post('/update', auth.checkRole("category_update"), async (req, res) => {
  try {

    let body = req.body;
    let updates = {};

    check.areThereEmptyFields(body, "_id");

    if (body.title) updates.title = body.title;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;
    if (typeof body.select_brokerage === "boolean") updates.select_brokerage = body.select_brokerage;
    if (check.isNumeric(body.type)) updates.type = body.type;

    if (body.type == Enum.CATEGORY_TYPES.FILE_ARCHIVE) updates.select_brokerage = false;

    updates.updated_by = req.user.id;

    await Categories.update(updates, { where: { _id: body._id } });

    let updated = (await Categories.findAll({ where: { _id: body._id } }) || [])[0] || {};

    auditLogs.info(req.user.email, "Category", "Update", `${updated.title} ${i18n.LOGS.CATEGORY_UPDATE}`);

    res.json(new Response().generateResponse(updated));
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

router.post('/delete', auth.checkRole("category_delete"), async (req, res) => {
  try {

    let body = req.body;

    check.areThereEmptyFields(body, "id");
    let category = (await Categories.findAll({ where: { _id: body.id } }) || [])[0] || {};

    await Categories.remove({ _id: body.id });

    auditLogs.info(req.user.email, "Category", "Delete", `${category.title} ${i18n.LOGS.CATEGORY_DELETE}`);

    return res.status(Enum.HTTP_CODES.OK).json(new Response().generateResponse({ success: true }))
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

module.exports = router;

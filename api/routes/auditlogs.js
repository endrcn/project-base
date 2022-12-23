var express = require('express');
var router = express.Router();
const moment = require("moment");

const AuditLogs = require("../db/models/AuditLogs");
const Response = require('../lib/Response');
const auth = require("../config/auth")();
const check = new (require("../lib/Check"))();

router.post('*', auth.authenticate(), function (req, res, next) {
  next();
})

router.post('/', auth.checkRole("auditlog_view"), async (req, res) => {
  try {

    let body = req.body;
    let query = {};
    let limit = 500;

    if (body.begin_date && body.end_date) {
      query.createdAt = {
        $gte: moment(body.begin_date),
        $lte: moment(body.end_date),
      }
    }

    if (body.search) {
      query.log = { $like: "%" + body.search + "%" };
    }

    if (check.isNumeric(body.limit) && body.limit < 500) {
      limit = body.limit;
    }

    let logs = await AuditLogs.findAll({ where: query, order: [["createdAt", "DESC"]], limit });

    return res.json(new Response().generateResponse(logs));
  } catch (err) {
    let response = new Response().generateError(err);
    res.status(response.code)
      .json(response);
  }
});

module.exports = router;

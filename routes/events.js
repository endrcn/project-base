var express = require('express');
var router = express.Router();
const Enum = require("../config/Enum");

const emitter = new (require("../lib/Emitter"))();

const headers = {
  "Content-Type": "text/event-stream",
  "Connection": "keep-alive",
  "Cache-Control": "no-cache, no-transform"
};


router.get('/', async (req, res) => {
  res.writeHead(200, headers);

  const listener = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  emitter.getEmitter("events").on(Enum.EMITTERS.NOTIFICATION, listener);

  req.on('close', () => {
    emitter.getEmitter("events").off(Enum.EMITTERS.NOTIFICATION, listener);
  });

});

module.exports = router;

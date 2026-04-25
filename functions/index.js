const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const app = require("./src/server");

setGlobalOptions({ region: "us-central1" });

exports.api = onRequest({ cors: true, maxInstances: 10 }, app);

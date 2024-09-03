const { createNodeMiddleware, createProbot } = require("probot");
const app = require("../../../index.js");

module.exports = createNodeMiddleware(app, {
  probot: createProbot(),
  webhooksPath: "/api/github/webhooks",
});

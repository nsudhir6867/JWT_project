const { createClient } = require("redis");
const client = createClient();

(async () => {
  await client.connect();
  await client.set("example", "foundit", "EX", 365 * 24 * 60 * 60);
  const ex = await client.get("example");
})();

client.on("error", () => {
  console.log("error occurred");
});

client.on("ready", () => {
  console.log("ready to use redis");
});

client.on("connect", () => {
  console.log("client connected to redis");
});

client.on("end", () => {
  console.log("client disconnected to redis");
});

process.on("SIGINT", () => {
  client.disconnect();
  //   process.exit(0);
});

module.exports = client;

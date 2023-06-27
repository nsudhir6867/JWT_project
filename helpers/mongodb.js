const mongoose = require("mongoose");

let db;
(async function db() {
  try {
    db = await mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.DB_NAME,
    });
    console.log("connection successful");
  } catch (err) {
    console.log(err);
  }
})();

mongoose.connection.on("connected", () => {
  console.log("mongoose connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

mongoose.connection.on("disconnected", () => {
  console.log("mongoose disconnected");
});

//Below event is fired whenever we press ctrl+c to stop the server.

// if (process.platform === "win32") {
//   var rl = require("readline").createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });

//   rl.on("SIGINT", async function () {
//     process.emit("SIGINT");
//   });
// }

// process.on("SIGINT", async () => {
//   //   console.log("Helloe");
//   //   await db.disconnect();
//   //   process.exit(0);
// });

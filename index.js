const writeReview = require("./review");
const cron = require("node-cron");

cron.schedule("0 0 * * *", async () => {
  console.log("Running Automation");
  await writeReview();
  console.log("completed Automation");
});

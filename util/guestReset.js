const { ToadScheduler, Task, SimpleIntervalJob } = require("toad-scheduler");

const scheduler = new ToadScheduler();

const task = new Task(
    "Reset Guest",
    () => {
        console.log("resetting guest account");
    },
    (err) => console.log(err)
);

const guestJob = new SimpleIntervalJob({ minutes: 30 }, task);

module.exports = { scheduler, guestJob };

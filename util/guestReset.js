const { ToadScheduler, Task, SimpleIntervalJob } = require("toad-scheduler");
const User = require("../schema/user");

const scheduler = new ToadScheduler();

const task = new Task(
    "Reset Guest",
    () => {
        console.log("resetting guest account");
        User.findOneAndUpdate(
            { username: "GUEST" },
            {
                email: "guest@test.com",
                favorites: [],
                reviews: [],
            },
            {},
            () => console.log("Guest account reset")
        );
    },
    (err) => console.log(err)
);

const guestJob = new SimpleIntervalJob({ minutes: 30 }, task);

module.exports = { scheduler, guestJob };

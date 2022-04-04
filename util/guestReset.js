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
                favorites: [
                    {
                        stationId: 158529,
                        title: "PIVET",
                        address: "2244 Metropolitan Pkwy SW Atlanta, GA 30315",
                        user: "623de9958c010352ed1e3958",
                        _id: "6248fb38e3c134faa1968df0",
                    },
                    {
                        stationId: 121844,
                        title: "BEACON",
                        address: "1035 Grant St SE Atlanta, GA 30315",
                        user: "623de9958c010352ed1e3958",
                        _id: "6248fb43e3c134faa1968df6",
                    },
                    {
                        stationId: 141473,
                        title: "COLUMBIA HONDA",
                        address: "1650 Heriford Rd Columbia, MO 65202",
                        user: "623de9958c010352ed1e3958",
                        _id: "6248fb4ee3c134faa1968dfd",
                    },
                    {
                        stationId: 72875,
                        title: "WOOD PARTNERS",
                        address: "4040 koehler Houston, TX 77007",
                        user: "623de9958c010352ed1e3958",
                        _id: "6248fb5ee3c134faa1968f32",
                    },
                ],
                reviews: [
                    {
                        stationId: 158529,
                        review: "Would charge here again!",
                        rating: 4,
                        isWorking: true,
                        user: "623de9958c010352ed1e3958",
                        _id: "6249eddcb0584ca92047ac95",
                    },
                    {
                        stationId: 141473,
                        review: "Great station! Unfortunately no nearby entertainment.",
                        rating: 3,
                        isWorking: true,
                        user: "623de9958c010352ed1e3958",
                        _id: "6249ef4bb0584ca92047aca3",
                    },
                ],
            },
            {},
            () => console.log("Guest account reset")
        );
    },
    (err) => console.log(err)
);

const guestJob = new SimpleIntervalJob({ minutes: 30 }, task);

module.exports = { scheduler, guestJob };

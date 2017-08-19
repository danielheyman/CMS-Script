const userRoutes = require("./users");
const structureRoutes = require("./structures");
const entryRoutes = require("./entries");

const constructorMethod = (app) => {
    app.use("/users", userRoutes);
    app.use("/structures", structureRoutes);
    app.use("/entries", entryRoutes);
    
    app.use("*", (req, res) => {
        res.status(404).json({error: "Page not found"});
    });
};

module.exports = constructorMethod;

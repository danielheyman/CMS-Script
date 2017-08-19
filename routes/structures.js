const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    const all = await sendMessage({
        eventName: "structures-getAll",
        data: null
    });

    res.status(all ? 200 : 400).json(all);
});

router.post("/", async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(400).json("Not an admin");
    }
    const result = await sendMessage({
        eventName: "structures-create",
        data: req.body
    });

    res.status(result ? 200 : 400).json(result);
});

router.put("/", async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(400).json("Not an admin");
    }
    const result = await sendMessage({
        eventName: "structures-update",
        data: req.body
    });

    res.status(result ? 200 : 400).json(result);
});


router.delete("/", async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(400).json("Not an admin");
    }
    const result = await sendMessage({
        eventName: "structures-delete",
        data: req.body._id
    });

    res.status(result === null ? 400 : 200).json({});
});

module.exports = router;

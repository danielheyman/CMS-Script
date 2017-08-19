const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    const all = await sendMessage({
        eventName: "users-getAll",
        data: null
    });

    res.json({
        currentUser: req.user && req.user._id,
        all,
    });
});

router.post("/", async (req, res) => {
    if (req.user) {
        return res.status(400).json("Not logged in");
    }
    const result = await sendMessage({
        eventName: "users-create",
        data: req.body
    });

    res.status(result ? 200 : 400).json(result);
});

router.put("/promote", async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(400).json("Not an admin");
    }
    const result = await sendMessage({
        eventName: "users-promote",
        data: req.body._id
    });

    res.status(result === null ? 400 : 200).json({});
});

router.put("/toggle-favorite", async (req, res) => {
    if (!req.user) {
        return res.status(400).json("Not logged in");
    }
    const result = await sendMessage({
        eventName: "users-toggleFavorite",
        data: Object.assign(req.body, {user_id: req.user._id})
    });

    res.status(result === null ? 400 : 200).json({});
});

module.exports = router;

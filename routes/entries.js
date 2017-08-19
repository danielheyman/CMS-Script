const express = require('express');
const router = express.Router();
const redis = require('redis');
const redisClient = redis.createClient();
const mkdirp = require('mkdirp');
const AdmZip = require('adm-zip');

router.get("/", (req, res) => {
    redisClient.get("entries", async (error, redisAll) => {
        if (!error && redisAll && redisAll !== "") {
            return res.json(JSON.parse(redisAll));
        }

        const all = await sendMessage({
            eventName: "entries-getAll",
            data: null
        });

        if (all) {
            redisClient.set("entries", JSON.stringify(all));
        }

        res.status(all ? 200 : 400).json(all);
    });
});

router.post("/", async (req, res) => {
    let body = JSON.parse(req.body.data);
    if (!req.user || !req.user.isAdmin) {
        return res.status(400).json("Not an admin");
    }
    const result = await sendMessage({
        eventName: "entries-create",
        data: Object.assign(body, {author: req.user && req.user._id})
    });

    if (result) {
        redisClient.set("entries", "");
        saveFiles(req, result.slug);
    }

    res.status(result ? 200 : 400).json(result);
});

const saveFiles = (req, slug) => {
    let body = JSON.parse(req.body.data);
    Object.keys(body.fields).forEach(key => {
        if (body.fields[key].file !== undefined) {
            mkdirp(`public/files/${slug}`, err => {
                if (err) {
                    return console.log("File upload error:", err);
                }
                const ext = body.fields[key].ext;
                const toZip = body.fields[key].toZip;
                if (!req.files) {
                    return;
                }
                const file = req.files[`file-${body.fields[key].file}`];
                if (!file) {
                    return;
                }
                const loc = `public/files/${slug}/${key}`;
                if (toZip && ext !== ".zip") {
                    const zip = new AdmZip();
                    zip.addFile(file.name, file.data, file.name);
                    zip.writeZip(`${loc}.zip`);
                } else {
                    file.mv(loc + ext, err => {
                        if (err) {
                            console.log("File upload error:", err);
                        }
                    })
                }
            })
        }
    })
}

router.put("/", async (req, res) => {
    let body = JSON.parse(req.body.data);
    if (!req.user || !req.user.isAdmin) {
        return res.status(400).json("Not an admin");
    }
    const result = await sendMessage({
        eventName: "entries-update",
        data: body
    });

    if (result) {
        redisClient.set("entries", "");
        saveFiles(req, result.slug);
    }

    res.status(result ? 200 : 400).json(result);
});

router.delete("/", async (req, res) => {
    if (!req.user || !req.user.isAdmin) {
        return res.json({error: true});
    }
    const result = await sendMessage({
        eventName: "entries-delete",
        data: req.body._id
    });

    if (result) {
        redisClient.set("entries", "");
    }

    res.status(result === undefined ? 400 : 200).json({});
});

router.post("/comment", async (req, res) => {
    if (!req.user) {
        return res.json({error: true});
    }
    const result = await sendMessage({
        eventName: "entries-comment",
        data: Object.assign(req.body, {author: req.user && req.user._id})
    });

    if (result) {
        redisClient.set("entries", "");
    }

    res.status(result ? 200 : 400).json(result);
});

router.post("/search", async (req, res) => {
    const result = await sendMessage({
        eventName: "entries-search",
        data: req.body
    });

    res.status(result ? 200 : 400).json(result);
});

module.exports = router;

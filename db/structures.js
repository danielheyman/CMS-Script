const uuid = require('node-uuid');
const bcrypt = require("bcrypt");
const mongoCollections = require("./config/mongoCollections");
const structures = mongoCollections.structures;
const entryModule = require("./entries");

// console.log("Fetching inital data...");
// const people = JSON.parse(fs.readFileSync('data.json'));
// console.log("Fetched!");

const isValidUrl = url => {
    try { new URL(url); return true; } catch(e) { return false; }
}
const isValidString = str => typeof str === "string" && str !== "";

const checkData = (data, structureCollection) => {
    res = {
        fields: []
    };
    if (!isValidString(data.name)) {
        throw "Must pass name";
    }
    res.name = data.name;
    if (!isValidString(data.slug)) {
        throw "Must pass slug";
    }
    if (structureCollection.find({slug: data.slug, _id: {$ne: data._id}}).length) {
        throw "Slug already exists on a structure";
    }
    res.slug = data.slug;
    if (!isValidString(data.description)) {
        throw "Must pass description";
    }
    res.description = data.description;
    if (isNaN(data.pageSize)) {
        throw "Please enter a valid page size";
    }
    res.pageSize = Math.max(parseInt(data.pageSize), 1);
    for (const field of (data.fields || [])) {
        if (!field.label) {
            throw "Make sure all fields have a label";
        }
        res.fields.push({
            _id: field._id || uuid.v4(),
            label: field.label,
            type: field.type,
        });
    }
    return res;
}

module.exports = dataModule = {
    getAll() {
        return structures().then((structureCollection) => {
            return structureCollection.find({}).toArray();
        });
    },
    getById(id) {
        return structures().then((structureCollection) => {
            return structureCollection.findOne({_id: id}).
            then(structure => {
                if (!structure) {
                    throw "Structure not found";
                }
                return structure;
            })
        });
    },
    create(data) {
        return structures().then((structureCollection) => {
            const newStructure = Object.assign(checkData(data, structureCollection), {
                _id: uuid.v4(),
            });
            
            return structureCollection.insertOne(newStructure).then(() => {
                return newStructure;
            });
        });
    },
    update(data) {
        return structures().then((structureCollection) => {
            return this.getById(data._id)
            .then(structure => {
                const updateStructure = checkData(data, structureCollection);
                delete updateStructure.slug;
                return structureCollection.update({_id: data._id}, {$set: updateStructure}).then(() => {
                    return Object.assign(structure, updateStructure);
                });
            })
        });
    },
    delete(id) {
        return structures().then((structureCollection) => {
            return this.getById(id)
            .then(structure => {
                return structureCollection.remove({_id: id})
                .then(() => {
                    return entryModule.deleteStructure(structure.slug);
                });
            })
            
        });
    },
};

const uuid = require('node-uuid');
const bcrypt = require("bcrypt");
const mongoCollections = require("./config/mongoCollections");
const entries = mongoCollections.entries;
const elasticClient = require('./config/elasticConnection');

// Create entries index if doesn't exist
elasticClient.indices.create({  
    index: 'entries'
}, (err,resp,status) => {
    if(err && resp.error.type !== "index_already_exists_exception") {
        console.log("Something weird happened. Maybe elastic is down?");
        throw resp;
    }
});

const isValidUrl = url => {
    try { new URL(url); return true; } catch(e) { return false; }
}
const isValidString = str => typeof str === "string" && str !== "";

const checkData = (data, entryCollection) => {
    res = {
        comments: []
    };
    if (!isValidString(data.title)) {
        throw "Must pass title";
    }
    res.title = data.title;
    if (!isValidString(data.structureSlug)) {
        throw "Must pass structureSlug";
    }
    res.structureSlug = data.structureSlug;
    if (!isValidString(data.slug)) {
        throw "Must pass slug";
    }
    if (entryCollection.find({slug: data.slug, _id: {$ne: data._id}}).length) {
        throw "Slug already exists on a entry";
    }
    res.slug = data.slug;
    if (!isValidString(data.blurb)) {
        throw "Must pass blurb";
    }
    res.blurb = data.blurb;
    if (!data.fields || typeof data.fields !== "object") {
        throw "Invalid fields object";
    }
    res.fields = data.fields;
    return res;
}

module.exports = dataModule = {
    getAll() {
        return entries().then((entryCollection) => {
            return entryCollection.find({}).toArray();
        });
    },
    getById(id) {
        return entries().then((entryCollection) => {
            return entryCollection.findOne({_id: id}).
            then(entry => {
                if (!entry) {
                    throw "entry not found";
                }
                return entry;
            })
        });
    },
    updateIndex(entry) {
        return elasticClient.index({
            index: 'entries',
            id: entry._id,
            type: entry.structureSlug,
            body: {
                "title": entry.title,
                "blurb": entry.blurb
            }
        });
    },
    create(data) {
        return entries().then((entryCollection) => {
            if (!isValidString(data.author)) {
                throw "Must pass author";
            }
            const newEntry = Object.assign(checkData(data, entryCollection), {
                _id: uuid.v4(),
                author: data.author
            });
            
            return entryCollection.insertOne(newEntry).then(() => {
                return this.updateIndex(newEntry);
            })
            .then(() => {
                return newEntry;
            });
        });
    },
    update(data) {
        return entries().then((entryCollection) => {
            return this.getById(data._id)
            .then(entry => {
                const updateEntry = checkData(data, entryCollection);
                delete updateEntry.structureSlug;
                delete updateEntry.slug;
                delete updateEntry.comments;
                const newEntry = Object.assign(entry, updateEntry);
                return entryCollection.update({_id: data._id}, {$set: updateEntry}).then(() => {
                    return this.updateIndex(newEntry);
                }).then(() => {
                    return newEntry;
                });
            })
        });
    },
    delete(_id) {
        return entries().then((entryCollection) => {
            return entryCollection.remove({_id});
        })
        .then(() => {
            return elasticClient.deleteByQuery({
                index: 'entries', 
                body: {
                    query: {
                        ids: { values: _id }
                    }
                }, 
            });
        });
    },
    deleteStructure(structureSlug) {
        return entries().then((entryCollection) => {
            return entryCollection.remove({structureSlug});
        })
        .then(() => {
            return elasticClient.deleteByQuery({
                index: 'entries', 
                body: {
                    query: {
                        type: { value: structureSlug }
                    }
                }, 
            });
        });
    },
    search(data) {
        return elasticClient.search({  
            index: 'entries',
            body: {
                query: {
                    bool: {
                        must: {
                            match: { _all: data.search }   
                        },
                        filter: {
                            type: { value: data.structureSlug }
                        }
                    }
                }
            }, 
        }).then(response => {
            return response.hits.hits.map(hit => hit._id);
        });
    },
    comment(data) {
        return entries().then((entryCollection) => {
            if (!isValidString(data.author)) {
                throw "Must pass author";
            }
            if (!isValidString(data.comment)) {
                throw "Must pass comment";
            }
            const newComment = {
                author: data.author,
                text: data.comment,
                date: Date.now()
            };
            return this.getById(data._id)
            .then(() => {
                return entryCollection.updateOne({ _id: data._id }, {$push: { comments: newComment }});
            })
            .then(() => {
                return newComment;
            })
        });
    }
};

const uuid = require('node-uuid');
const bcrypt = require("bcrypt");
const mongoCollections = require("./config/mongoCollections");
const users = mongoCollections.users;

// console.log("Fetching inital data...");
// const people = JSON.parse(fs.readFileSync('data.json'));
// console.log("Fetched!");

const isValidUrl = url => {
    try { new URL(url); return true; } catch(e) { return false; }
}
const isValidString = str => typeof str === "string" && str !== "";

module.exports = dataModule = {
    getAll() {
        return users().then((userCollection) => {
            return userCollection.find({},{fields: {password: 0}}).toArray()
        });
    },
    create(data) {
        return users().then((userCollection) => {
            if (!isValidString(data.username)) {
                throw "Must pass first_name";
            }
            if (!isValidString(data.password)) {
                throw "Must pass password";
            }
            if (!isValidString(data.biography)) {
                throw "Must pass biography";
            }
            
            let newUser = {
                _id: uuid.v4(),
                biography: data.biography,
                username: data.username,
                password: bcrypt.hashSync(data.password, 5),
                isAdmin: false,
                signupDate: Date.now(),
                favorites: []
            };
            
            return userCollection.insertOne(newUser).then(() => {
                return newUser;
            });
        });
    },
    promote(_id) {
        return users().then((userCollection) => {
            return userCollection.updateOne({ _id }, {$set: { isAdmin: true }});
        });
    },
    getById(_id) {
        return users().then((userCollection) => {
            return userCollection.findOne({_id})
            .then(user => {
                if (!user) {
                    throw "User not found";
                }
                return user;
            })
        });
    },
    auth(data) {
        return users().then((userCollection) => {
            return userCollection.findOne({username: data.username})
            .then(user => {
                if (!bcrypt.compareSync(data.password, user.password)) {
                    throw "Incorrect password";
                }
                return user;
            });
        });
    },
    toggleFavorite(data) {
        return users().then((userCollection) => {
            return this.getById(data.user_id)
            .then(user => {
                const type = user.favorites.includes(data._id) ? "$pull" : "$push";
                return userCollection.updateOne({ _id: data.user_id }, {[type]: { favorites: data._id }});
            })
        });
    }
};

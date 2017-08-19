const mongoCollections = require("./config/mongoCollections");
const userModule = require("./users");
const structureModule = require("./structures");
const elasticClient = require('./config/elasticConnection');
const entryModule = require("./entries");
const redis = require('redis');
const redisClient = redis.createClient();

let savedUser;
let savedStructure;
let savedStructure2;

return mongoCollections.users().then((userCollection) => {
    console.log("Removing users...");
    return userCollection.remove({});
})
.then(() => {
    console.log("Inserting users...");
    return userModule.create({
        biography: "Some user biography",
        username: "daniel",
        password: "test"
    })
    .then(user => {
        console.log("Promoting user...");
        savedUser = user;
        return userModule.promote(user._id);
    })
    .then(() => {
        return userModule.create({
            username: "bob",
            biography: "I am an awesome person",
            password: "test2"
        });
    })
})
.then(() => {
    console.log("Removing structures...");
    return mongoCollections.structures()
    .then((structureCollection) => {
        return structureCollection.remove({});
    })
})
.then(() => {
    console.log("Inserting structures...");
    return structureModule.create({
        name: "Animals",
        slug: "animals",
        description: "The best animals in the world!",
        pageSize: 2,
        fields: [{
            _id: "seedImage",
            label: "Image",
            type: "picture"
        }, {
            label: "Who's it for?",
            type: "textarea"
        }, {
            label: "Life expectancy",
            type: "number"
        }, {
            label: "Child Friendly?",
            type: "checkbox"
        }, {
            label: "More info",
            type: "link"
        }, {
            _id: "seedFile",
            label: "Zipped Image",
            type: "file"
        }, {
            label: "Also recommend",
            type: "reference"
        }]
    })
    .then(structure => {
        savedStructure = structure;
    })
})
.then(() => {
    console.log("Inserting structures...");
    return structureModule.create({
        name: "Books",
        slug: "books",
        description: "The best books in the world!",
        pageSize: 2,
        fields: [{
            label: "Video Review",
            type: "youtube"
        }, {
            label: "Published",
            type: "datepicker"
        }, {
            label: "Summary",
            type: "wysiwyg"
        }]
    })
    .then(structure => {
        savedStructure2 = structure;
    })
})
.then(() => {
    console.log("Removing entries...");
    return mongoCollections.entries()
    .then((entryCollection) => {
        return entryCollection.remove({});
    })
})
.then(() => {
    console.log("Deleting elastic entries...");
    return elasticClient.indices.delete({index: 'entries'});
})
.then(() => {
    console.log("Inserting entries...");
    return entryModule.create({
        author: savedUser._id,
        title: "Dog",
        structureSlug: "animals",
        slug: "dog",
        blurb: "Dogs are very loving!",
        fields: {
            [savedStructure.fields[0]._id]: {
                ext: ".jpg"    
            },
            [savedStructure.fields[1]._id]: "Anyone who wants lots and lots of love!",
            [savedStructure.fields[2]._id]: 15,
            [savedStructure.fields[3]._id]: true,
            [savedStructure.fields[4]._id]: {
                label: "Wikipedia",
                url: "https://en.wikipedia.org/wiki/Dog"    
            },
            [savedStructure.fields[5]._id]: {
                ext: ".jpg"    
            },
            [savedStructure.fields[6]._id]: "cat",
        }
    })
    .then(entry => {
        console.log("Commenting on entry...");
        return entryModule.comment({
            _id: entry._id,
            author: savedUser._id,
            comment: "This is the best comment of all!"
        })
        .then(() => {
            console.log("Favoriting an entry...");
            return userModule.toggleFavorite({_id: entry._id, user_id: savedUser._id});
        })
    })
})
.then(() => {
    return entryModule.create({
        author: savedUser._id,
        title: "Cat",
        structureSlug: "animals",
        slug: "cat",
        blurb: "Cats are very soft!",
        fields: {
            [savedStructure.fields[0]._id]: {
                ext: ".jpg"    
            },
            [savedStructure.fields[1]._id]: "Anyone who wants a small ball of fur!",
            [savedStructure.fields[2]._id]: 10,
            [savedStructure.fields[3]._id]: true,
            [savedStructure.fields[4]._id]: {
                label: "Wikipedia",
                url: "https://en.wikipedia.org/wiki/Cat"    
            },
            [savedStructure.fields[5]._id]: {
                ext: ".jpg"    
            },
            [savedStructure.fields[6]._id]: "dog",
        }
    })
})
.then(() => {
    return entryModule.create({
        author: savedUser._id,
        title: "Fish",
        structureSlug: "animals",
        slug: "fish",
        blurb: "Fish are very swell!",
        fields: {
            [savedStructure.fields[0]._id]: {
                ext: ".jpg"    
            },
            [savedStructure.fields[1]._id]: "Anyone who doesn't have time!",
            [savedStructure.fields[2]._id]: 2,
            [savedStructure.fields[3]._id]: true,
            [savedStructure.fields[4]._id]: {
                label: "Wikipedia",
                url: "https://en.wikipedia.org/wiki/Fish"    
            },
            [savedStructure.fields[5]._id]: {
                ext: ".jpg"    
            },
            [savedStructure.fields[6]._id]: "cat",
        }
    })
    .then(entry => {
        return userModule.toggleFavorite({_id: entry._id, user_id: savedUser._id});
    })
})
.then(() => {
    return entryModule.create({
        author: savedUser._id,
        title: "Prey",
        structureSlug: "books",
        slug: "prey",
        blurb: "In the Nevada desert, an experiment has gone horribly wrong. A cloud of nanoparticles—micro-robots—has escaped from the laboratory.",
        fields: {
            [savedStructure2.fields[0]._id]: "https://www.youtube.com/embed/Nwco-yaj1qg",
            [savedStructure2.fields[1]._id]: new Date("November 25, 2002"),
            [savedStructure2.fields[2]._id]: '<p><strong><em>Prey</em></strong>&nbsp;is a novel by&nbsp;<a href="https://en.wikipedia.org/wiki/Michael_Crichton" target="_blank" style="color: rgb(11, 0, 128);">Michael Crichton</a>, first published in November 2002. An excerpt was published in the January–February 2003 issue of&nbsp;<a href="https://en.wikipedia.org/wiki/Seed_(magazine)" target="_blank" style="color: rgb(11, 0, 128);"><em>Seed</em></a>. Like&nbsp;<a href="https://en.wikipedia.org/wiki/Jurassic_Park_(novel)" target="_blank" style="color: rgb(11, 0, 128);"><em>Jurassic Park</em></a>, the novel serves as a&nbsp;<a href="https://en.wikipedia.org/wiki/Cautionary_tale" target="_blank" style="color: rgb(11, 0, 128);">cautionary tale</a>&nbsp;about developments in science and&nbsp;<a href="https://en.wikipedia.org/wiki/Technology" target="_blank" style="color: rgb(11, 0, 128);">technology</a>; in this case,&nbsp;<a href="https://en.wikipedia.org/wiki/Nanotechnology" target="_blank" style="color: rgb(11, 0, 128);">nanotechnology</a>,&nbsp;<a href="https://en.wikipedia.org/wiki/Genetic_engineering" target="_blank" style="color: rgb(11, 0, 128);">genetic engineering</a>&nbsp;and&nbsp;<a href="https://en.wikipedia.org/wiki/Artificial_intelligence" target="_blank" style="color: rgb(11, 0, 128);">artificial intelligence</a>.</p><p>The book features relatively new advances in the computing/scientific community, such as&nbsp;<a href="https://en.wikipedia.org/wiki/Artificial_life" target="_blank" style="color: rgb(11, 0, 128);">artificial life</a>,&nbsp;<a href="https://en.wikipedia.org/wiki/Emergence" target="_blank" style="color: rgb(11, 0, 128);">emergence</a>&nbsp;(and by extension,&nbsp;<a href="https://en.wikipedia.org/wiki/Complexity" target="_blank" style="color: rgb(11, 0, 128);">complexity</a>),&nbsp;<a href="https://en.wikipedia.org/wiki/Genetic_algorithms" target="_blank" style="color: rgb(11, 0, 128);">genetic algorithms</a>, and&nbsp;<a href="https://en.wikipedia.org/wiki/Intelligent_agent" target="_blank" style="color: rgb(11, 0, 128);">agent</a>-based computing. Fields such as&nbsp;<a href="https://en.wikipedia.org/wiki/Population_dynamics" target="_blank" style="color: rgb(11, 0, 128);">population dynamics</a>&nbsp;and&nbsp;<a href="https://en.wikipedia.org/wiki/Host%E2%80%93parasite_coevolution" target="_blank" style="color: rgb(11, 0, 128);">host-parasite coevolution</a>&nbsp;are also at the heart of the novel.</p>'
        }
    })
    .then(entry => {
        return userModule.toggleFavorite({_id: entry._id, user_id: savedUser._id});
    })
})
.then(() => {
    console.log("Removing entries cache...");
    redisClient.set("entries", "");
})
.then(() => {
    console.log("Done");
    process.exit();
});
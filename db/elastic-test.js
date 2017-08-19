const client = require('./config/elasticConnection');
const entries = require("./entries");

entries.search({structureSlug: "animals", search: "awesome"})
.then(data => {
    console.log(data);
})

/*
client.indices.create({  
    index: 'entries'
}, (err,resp,status) => {
    if(err && resp.error.type !== "index_already_exists_exception") {
        throw resp;
    }
    client.index({
        index: 'entries',
        id: '1',
        type: 'animals',
        body: {
            "title": "Dog",
            "blurb": "Dogs are really awesome!"
        }
    }, (err,resp,status) => {
        if(err) {
            throw err;
        }
        // Successfully saved/updated
    });
    client.search({  
        index: 'entries',
        type: 'animals',
        body: {
            query: {
                match: { _all: "awesome" }
            }
        }, 
    }, (error, response,status) => {
        if (error){
            throw error;
        }
        response.hits.hits.forEach(hit => {
            console.log(hit);
        })
    });
});
*/
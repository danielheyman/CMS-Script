const uuid = require('node-uuid');
const mongoCollections = require("./config/mongoCollections");
const tasks = mongoCollections.tasks;

let exportedMethods = {
    mapTask(task) {
        task.id = task._id;
        delete task._id;
        return task;
    },
    getTasks(skip, take) {
        return tasks().then((taskCollection) => {
            return taskCollection.find({}, {skip: skip, limit: take}).toArray().catch((error) => {
                throw new HTTPError(500, error);
            }).then((tasks) => {
                return tasks.map(this.mapTask);
            });
        });
    },
    getTask(id) {
        return tasks().then((taskCollection) => {
            return taskCollection.findOne({_id: id}).catch((error) => {
                throw new HTTPError(500, error);
            }).then((task) => {
                if (!task) throw new HTTPError(404, 'Task not found');
                return this.mapTask(task);
            });
        });
    },
    addTask(title, description, hoursEstimated, completed) {
        return tasks().then((taskCollection) => {
            if(title === undefined) throw new HTTPError(400, "Missing title field");
            if(description === undefined) throw new HTTPError(400, "Missing description field");
            if(hoursEstimated === undefined) throw new HTTPError(400, "Missing hoursEstimated field");
            if(completed === undefined) throw new HTTPError(400, "Missing completed field");
            
            let newTask = {
                _id: uuid.v4(),
                title: title,
                description: description,
                hoursEstimated: parseInt(hoursEstimated),
                completed: completed === 'true',
                comments: []
            };
            
            return taskCollection.insertOne(newTask).then((newInsertInformation) => {
                return newInsertInformation.insertedId;
            }).then((newId) => {
                return this.getTask(newId);
            }).catch((err) => {
                throw err;
            });
        });
    },
    updateAllTaskFields(id, title, description, hoursEstimated, completed) {
        return tasks().then((taskCollection) => {
            if(title === undefined) throw new HTTPError(400, "Missing title field");
            if(description === undefined) throw new HTTPError(400, "Missing description field");
            if(hoursEstimated === undefined) throw new HTTPError(400, "Missing hoursEstimated field");
            if(completed === undefined) throw new HTTPError(400, "Missing completed field");
            
            return this.updateSomeTaskFields(id, title, description, hoursEstimated, completed);
        });
    },
    updateSomeTaskFields(id, title, description, hoursEstimated, completed) {
        return tasks().then((taskCollection) => {
            return this.getTask(id).catch(err => { throw err; }).then(task => {
                delete task.id;
                
                if(title !== undefined) task.title = title;
                if(description !== undefined) task.description = description;
                if(hoursEstimated !== undefined) task.hoursEstimated = parseInt(hoursEstimated);
                if(completed !== undefined) task.completed = completed === 'true';

                return taskCollection.updateOne({ _id: id }, task).then((result) => {
                    return this.getTask(id);
                });
            })
            
        });
    },
    addTaskComment(id, name, comment) {
        return tasks().then((taskCollection) => {
            if(name === undefined) throw new HTTPError(400, "Missing name field");
            if(comment === undefined) throw new HTTPError(400, "Missing comment field");
            
            return this.getTask(id).catch(err => { throw err; }).then(task => {
                delete task.id;
                
                task.comments.push({
                    id: uuid.v4(),
                    name: name,
                    comment: comment
                });

                return taskCollection.updateOne({ _id: id }, task).then((result) => {
                    return this.getTask(id);
                });
            })
            
        });
    },
    deleteTaskComment(id, taskId) {
        return tasks().then((taskCollection) => {
            return this.getTask(id).catch(err => { throw err; }).then(task => {
                delete task.id;
                
                let found = -1;
                task.comments.forEach((comment, i) => {
                    if(comment.id === taskId) found = i;
                });
                
                if(found === -1) throw new HTTPError(404, 'Comment not found');
                
                task.comments.splice(found, 1);

                return taskCollection.updateOne({ _id: id }, task).then((result) => {
                    return this.getTask(id);
                });
            });
            
        });
    }
}

module.exports = exportedMethods;

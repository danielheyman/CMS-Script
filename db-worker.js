const redisConnection = require("./redis/redis-connection");
const userModule = require("./db/users");
const structureModule = require("./db/structures");
const entryModule = require("./db/entries");

console.log("DB Worker is running through redis");

redisConnection.on('*:request:*', (message, channel) => {
  const requestId = message.requestId;
  const eventName = message.eventName;
  const successEvent = `${eventName}:success:${requestId}`;
  const failedEvent = `${eventName}:failed:${requestId}`;
  
  const res = (failed, data) => {
    redisConnection.emit(failed ? failedEvent : successEvent, {
      requestId: requestId,
      data: data,
      eventName: eventName
    });
  }

  const promiseRes = (promise) => {
    promise.then(data => res(false, data)).catch(e => res(true, e));
  }

  const matchUser = eventName.match(/users-(.+)/);
  const matchStructure = eventName.match(/structures-(.+)/);
  const matchEntry = eventName.match(/entries-(.+)/);
  if (matchUser && userModule.hasOwnProperty(matchUser[1])) {
    promiseRes(userModule[matchUser[1]](message.data));
  } else if (matchStructure && structureModule.hasOwnProperty(matchStructure[1])) {
    promiseRes(structureModule[matchStructure[1]](message.data));
  } else if (matchEntry && entryModule.hasOwnProperty(matchEntry[1])) {
    promiseRes(entryModule[matchEntry[1]](message.data));
  } else {
    res(true, "Unknown event");
  }
});

const childProcess = require('child_process').fork('./app/boss');
// boss runs on other process
module.exports = childProcess;

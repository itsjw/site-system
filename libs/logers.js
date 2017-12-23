const Console = require("console").Console,
    loger  = require('express-pino-logger'),
    options = require("../config.json"),
    fs = require("fs");


const option = {
    encoding: options.log.encoding,
    flags : ((options.log.continueLogs)?"a":"w")
};


const   outLog = fs.createWriteStream(options.log.path + "logOut.log", option),
        outErr = fs.createWriteStream(options.log.path + "errOut.log", option),
        outHttp = fs.createWriteStream(options.log.path +   "Http+s.log", option);

if (options.log.continueLogs) {
    outLog.write("/n/n", "utf-8");
    outErr.write("/n/n", "utf-8"); 
    outHttp.write("/n/n", "utf-8");
}

console._stdout = outLog;
console._stderr = outErr;

//console = new Console(outLog, outErr);

module.exports = loger({}, outHttp);
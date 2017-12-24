const express    = require("express"),
    options      = require("./config.json"),
    mongoose     = require("mongoose"),
    bodyParser   = require("body-parser"),
    cookieParser = require("cookie-parser"),
    staticServer = require("express-static"),
    http   = require("http"),
    fs     = require("fs"),
    async  = require("async"),
    multer = require('multer');

const app = express();
// file upload
const upload = multer({ dest: 'uploads/' });


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
//file
app.use(bodyParser.raw({ type: 'application/form-data' }));

// cookie
app.use(cookieParser());

//loger
const loger = require("./libs/logers.js");
app.use(function (req, res, next) {
    var freeLogin = options.login.loginFree.find(function (value) {
        return req.url.indexOf(value) == 0;
    });
    if (freeLogin) {
        return next();
    } else {
        loger(req, res, next);
    }
});


app.set('view engine', 'ejs');
app.engine("ejs", require("ejs-locals"));

require("./libs/login.js")(app);
require("./libs/forUser.js")(app);

//admin pages
require("./libs/adminPages.js")(app);
//API for admin panel
require("./libs/userAPI.js")(app, upload);               // User API
require("./libs/coursesAPI.js")(app, upload, __dirname); // Course API



app.get("/", function (req, res) {
    res.redirect("/startPage");
});
//static server
app.use(staticServer(__dirname + '/public'));

//error parser
app.use("/", function(err, req, res, next) {
    var status, statusMesage;
    
    if ( typeof err == "number") {
        status = err;
    } else {
        status = 500;
    }
    
    if ( err.errno == -2 && err.path ) {
        status = 404;
    }
    
    res.render("error", {
        error: err,
        status: status,
        statusMesage: statusMesage || http.STATUS_CODES[status],
        
    }, function (err, data) {
        res.status(status).send(data || "<pre>" + err +"</pre>");
    });
    
    if ( req.user ) {
        console.log(err);
    }
});


async.waterfall(
    [
        function (callback) {
            options.db.reconnectTries = Number.MAX_VALUE;
            
            mongoose.connect(options.db.url, options, callback);
            
            mongoose.connection.on('error',function (err) {  
                console.error('Mongoose default connection error: ' + err);
                callback(err);
            });
        },
    ],
    
    function (err, result) {
        if ( err ) {
            throw err;
        }
        
        if ( options.server.ip ) {
            http.createServer(app).listen(options.server.port || 80, options.serv.ip);
        } else {
            http.createServer(app).listen(options.server.port || 80);
        }
        
        log("Server run");
    } 
);


function log(str) {
    process.stdout.write(str + "\n", "utf-8");
}

const express    = require("express"),
    options      = require("./config.json"),
    mongoose     = require("mongoose"),
    bodyParser   = require("body-parser"),
    cookieParser = require("cookie-parser"),
    staticServer = require("express-static"),
    fs     = require("fs"),
    http   = require("http"),
    hash   = require("password-hash"),
    async  = require("async"),
    multer = require('multer');
    
const User = require("./libs/class.js").User;

const app = express();
// file upload
const upload = multer({ dest: 'uploads/' })



// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
//file
app.use(bodyParser.raw({ type: 'application/form-data' }));

// cookie
app.use(cookieParser());


app.set('view engine', 'ejs');
app.engine("ejs", require("ejs-locals"));

require("./libs/login.js")(app);

app.use("/choose_course", function (req, res, next) {
    if ( !req.passport.client(next) ) {
        return;
    }
    
    async.waterfall([
            function (callback) {
                res.render("choose_course", {
                    user: req.user || {}
                }, callback);
            }
        ],
        function(err, result) {
            if ( err ) {
                next(err);
            }
            
            res.status(200).send(result);
        }
    );
});



//********************************************************
//          Admin
app.use("/edit_courses", function (req, res, next) {
    if ( !req.passport.admin(next) ) {
        return;
    }
    
    async.waterfall([
            function (callback) {
                res.render("courses", {
                    user: req.user
                }, callback);
            }
        ],
        function(err, result) {
            if ( err ) {
                next(err);
            }
            
            res.status(200).send(result);
        }
    );
});


app.use("/personal", function (req, res, next) {
    if ( !req.passport.admin(next) ) {
        return;
    }
    
    // if message display message
    if ( req.query.err || req.query.save || req.query.deleted ) {
        // if not this cookie = redirct/not display messge
        if ( !req.cookies.notDeletQuery ) {
            return res.redirect("/personal");
        }
    }
    
    res.clearCookie("notDeletQuery", {
        path: "/personal"
    });
    
    async.waterfall([
            function (callback) {
                User.find({}, callback);
            },
            function (users, callback) {
                res.render("personal", {
                    users: users || [],
                    user: req.user || {},
                    
                    
                    deleted : req.query.deleted || "",
                    errMessage: req.query.err || "",
                    save : req.query.save || "",
                },
                callback
            );
            }
        ],
        function(err, result) {
            if ( err ) {
                return next(err);
            }
            
            res.status(200).send(result);
        }
    );
});
app.use("/course-management", function (req, res, next) {
    fs.readFile("views/course-management.html", "utf-8", function (err, data) {
        if ( err ) {
            next(err);
        }
        
        res.status(200).send(data);
    });
});


app.use("/edit-video", function (req, res, next) {
    fs.readFile("views/edit-video.html", "utf-8", function (err, data) {
        if ( err ) {
            next(err);
        }
        
        res.status(200).send(data);
    });
});


app.use("/edit-step", function (req, res, next) {
    fs.readFile("views/edit-step.html", "utf-8", function (err, data) {
        if ( err ) {
            next(err);
        }
        
        res.status(200).send(data);
    });
});


// User API
require("./libs/userAPI.js")(app, upload);

//static server
app.use(staticServer(__dirname + '/public'));

//error parser
app.use("/", function(err, req, res, next) {
    console.error(err);
    res.status(500).send("error: " + err);
});

async.waterfall(
    [
        function (callback) {
            options.db.reconnectTries = Number.MAX_VALUE;
            
            mongoose.connect(options.db.url, options, callback);
        },
    ],
    
    function (err, result) {
        if ( err ) {
            throw err;
        }
        
        http.createServer(app).listen(8080);
        console.log("Server runing");
    } 
);


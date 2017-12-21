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
    
const User = require("./libs/class.js").User,
    Course = require("./libs/class.js").Course,
    Step   = require("./libs/class.js").Step;

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


app.set('view engine', 'ejs');
app.engine("ejs", require("ejs-locals"));

require("./libs/login.js")(app);

app.use("/choose_course", function (req, res, next) {
    if ( !req.passport.client(next) ) {
        return;
    }
    
    async.waterfall([
            Course.find.bind(Course, {}),
            function (courses, callback) {
                // for each courses
                async.concat(courses,
                    function (course, callback) {
                        // for each steps(Id) of course and find in data base
                        async.concat(
                            course.steps, 
                            function (stepId, callback) {
                                // find step in data base
                                Step.findById(stepId, function (err, step) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    callback(null, step || 1);
                                });
                            },
                            function (err, result) {
                                // write/set steps in property "stepsData"
                                course.stepsData = result;
                                /*
                                    Now:
                                    courses = [course1, course2, ...],
                                        course of courses :
                                            course.stepsData = [step1, step2, ...],
                                            course.steps = [step1Id, step2Id, ...]
                                */ 
                                callback(err, courses);
                            }
                        );
                    },
                    function (err, result) {
                        callback(err, courses);
                    }
                );
            },
            function (courses, callback) {
                console.log(courses);
                res.render("choose_course", {
                    user: req.user,
                    
                    
                    courses: courses
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
//                       Admin
app.get("/edit_course/:id", function (req, res, next) {
    if ( !req.passport.admin(next) ) {
        return;
    }
    
    // if message display message
    if ( req.query.err || req.query.save || req.query.deleted ) {
        // if not this cookie = redirct/not display messge
        if ( !req.cookies.notDeletQuery ) {
            return res.redirect("/edit_course/" + req.params.id);
        }
    }
    
    res.clearCookie("notDeletQuery", {
        path: "/edit_course"
    });
    
    
    async.waterfall([
            Course.findById.bind(Course, req.params.id),
            function (course, callback) {
                async.concat(course.steps, 
                    function (stepId, callback) {
                        Step.findById(stepId, function (err, step) {
                            callback(null, step);
                            if (err) {
                                console.error(err);
                            }
                        });
                    },
                    function (err, steps) {
                        callback(err, course, steps);
                    }
                );
            },
            function (course, steps, callback) {
                res.render("course-management", {
                    user : req.user,
                    steps: steps,
                    course: course,
                    
                    
                    deleted : req.query.deleted || "",
                    errMessage: req.query.err || "",
                    save : req.query.save || ""
                }, callback);
            }
        ],
        function (err, result) {
            if (err) {
                return next(err);
            }
            
            res.send(result);
        }
    );
});

app.get("/edit_courses", function (req, res, next) {
    if ( !req.passport.admin(next) ) {
        return;
    }
    
    // if message display message
    if ( req.query.err || req.query.save || req.query.deleted ) {
        // if not this cookie = redirct/not display messge
        if ( !req.cookies.notDeletQuery ) {
            return res.redirect("/edit_courses");
        }
    }
    
    res.clearCookie("notDeletQuery", {
        path: "/edit_courses"
    });
    
    async.waterfall([
            Course.find.bind(Course, {}),
            function (courses, callback) {
                res.render("courses", {
                    user: req.user,
                    courses: courses,
                    
                    deleted : req.query.deleted || "",
                    errMessage: req.query.err || "",
                    save : req.query.save || "",
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

app.get("/personal", function (req, res, next) {
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
// Course API
require("./libs/coursesAPI.js")(app, upload, __dirname);


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
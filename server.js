const express = require("express"),
    bodyParser = require("body-parser"),
    staticServer = require("express-static"),
    fs = require("fs"),
    http = require("http");

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());


//login
app.use("/login", function (req, res, next) {
    fs.readFile("views/login.html", "utf-8", function (err, data) {
        if ( err ) {
            next(err);
        }
        
        res.status(200).send(data);
    });
});


app.use("/personal", function (req, res, next) {
    fs.readFile("views/personal.html", "utf-8", function (err, data) {
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


app.use("/courses", function (req, res, next) {
    fs.readFile("views/courses.html", "utf-8", function (err, data) {
        if ( err ) {
            next(err);
        }
        
        res.status(200).send(data);
    });
});


app.use("/course-management", function (req, res, next) {
    fs.readFile("views/course-management.html", "utf-8", function (err, data) {
        if ( err ) {
            next(err);
        }
        
        res.status(200).send(data);
    });
});



app.use("/choose_course", function (req, res, next) {
    fs.readFile("views/choose_course.html", "utf-8", function (err, data) {
        if ( err ) {
            next(err);
        }
        
        res.status(200).send(data);
    });
});

//static server
app.use(staticServer(__dirname + '/public'));

//error parser
app.use("/", function(err, req, res, next) {
    console.log(err);
    res.status(500).send(err);
});

http.createServer(app).listen(8080);


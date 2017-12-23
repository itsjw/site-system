const async = require("async");

const { User, Step, Course } =  require("./class.js");

module.exports = function navData(callback) {
    Course.find({}, function (err, courses) {
        if ( err ) {
            return callback(err);
        }
        addSteps(courses, callback);
    });
    
    function addSteps(courses, callback) {
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
                                console.error(err);
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
    }
};
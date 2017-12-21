const mongoose = require("mongoose"),
    hash = require("password-hash");
    
    

const User = getUserClass(),
    Step   = getStepClass(),
    Course = getCourseClass();


module.exports = {
    User: User,
    Course: Course,
    Step: Step
};


function getUserClass() {
    var schema = new mongoose.Schema({
        // User data
        name    : {
            type: String,
            required: true,
            
        },
        surname : {
            type: String,
            required: true,
            
        },
        
        // Login data
        Email    : {
            type: String,
            required: true,
        },
        password : {
            type : String,
            required: true,
            set: function (value) {
                return hash.generate(value);
            }
        },
        
        admin: {
            type: Boolean,
            default: false
        },
        
        
        // Progres data
        passedCourses : {
            type: Number,
            default: 0
        },
        passedSlide   : {
            type: Number,
            default: 0
        }
    });
    
    return mongoose.model('User', schema);
}

function getCourseClass () {
    var schema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        
        steps: {
            type: Array,
            default: []
        }
    });
    
    schema.methods.delete = function (index) {
        //if index > lenght
        if ( this.steps.length >= index.length ) {
            return new TypeError("steps.length >= index.length");
        }
        
        // Deleted this step of DataBase
        Step.findById((this.steps[index]), function (err, step) {
            if (err) {
                console.error(err);
            }
            if (step) {
                step.remove(function (err) {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });
        
        // Delete of array steps
        this.steps.slice(index, 1);
    };
    
    return mongoose.model('Course', schema);
}

function getStepClass () {
    var schema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        
        type: {
            type: String,
            required: true,
            enum: ["video", "step"]
        },
        
        video: {
            type: String,
            default: ""
        },
        
        step: {
            type: String,
            default: ""
        }
    });
    
    return mongoose.model('Step', schema);
}
const mongoose = require("mongoose"),
    hash = require("password-hash");
    
    




module.exports = {
    User: getUserClass()
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
            
        }
    });
}
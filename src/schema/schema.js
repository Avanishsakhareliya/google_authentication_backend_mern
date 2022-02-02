const mongoose = require("mongoose");
const { stringify } = require("nodemon/lib/utils");
const validator = require("validator")

const struct = mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        // unique: true,
        // validator(value) {
        //     if (!validator.isEmail(value)) {
        //         throw new Error("invalid email");
        //     }
        // }
    },
    password: {
        type: String,
    },
    c_password: {
        type: String
    },
    token: String
   

})


const result = mongoose.model("authentication", struct);

module.exports = result;

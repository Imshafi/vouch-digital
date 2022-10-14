const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    UserName : String,
    MobileNumber : Number,
});

module.exports = mongoose.model('user-contacts',userSchema);


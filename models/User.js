const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require("md5");
const validator = require("validator");
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: "This address is already in use",
		lowercase: true,
		trim: true,
		validate: [validator.isEmail, "This is not a valid email address"],
		required: "Please enter an email address"
	},
	name: {
		type: String,
		required: "Name is required",
		trim: true
	}
});

userSchema.plugin(passportLocalMongoose, { usernameFields: "email" });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("User");

const passport = require("passport");

exports.login = passport.authenticate("local", {
	failureRedirect: "/login",
	failureFlach: "Failed to log in",
	successRedirect: "/",
	successFlash: "You are now all logged in!"
});

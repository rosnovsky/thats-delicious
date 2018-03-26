const passport = require("passport");

exports.login = passport.authenticate("local", {
	failureRedirect: "/login",
	failureFlach: "Failed to log in",
	successRedirect: "/",
	successFlash: "You are now all logged in!"
});

exports.logout = (req, res) => {
	req.logout();
	req.flash("success", "You are now all logged out ✅");
	res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
		return;
	}
	req.flash("error", "Please log in!");
	res.redirect("/login");
};

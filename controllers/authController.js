const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

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

exports.forgot = async (req, res) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		req.flash(
			"success",
			"If an account with this email address exists, you'll recieve a password recovery email"
		);
		return res.redirect("/login");
	}
	user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
	user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();

	const resetUrl = `http://${req.headers.host}/account/reset/${
		user.resetPasswordToken
	}`;
	req.flash(
		"success",
		`If an account with this email address exists, you'll recieve a password recovery email. <a href=${resetUrl}>Reset</a>`
	);
	res.redirect("/login");
};

exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});
	if (!user) {
		req.flash("error", "Password recovery has expired. Please, try again.");
		return res.redirect("/login");
	}
	res.render("reset", { title: "Reset your password" });
	// res.json(user);
};

exports.confirmPasswords = (req, res, next) => {
	if (req.body.password === req.body["password-confirm"]) {
		next();
		return;
	}
	req.flash("error", "Passwords do not match!");
};

exports.updatePassword = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});
	if (!user) {
		req.flash("error", "Password recovery has expired. Please, try again.");
		return res.redirect("/login");
	}
	const setPassword = promisify(user.setPassword, user);
	await setPassword(req.body.password);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const userUpdated = await user.save();
	await req.login(user);
	req.flash("success", "Your password has been updated!");
	res.redirect("/");
};

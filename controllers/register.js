import jwt from "jsonwebtoken";
import User from "../models/user.js";
import {
	errorMessage,
	validateRegisterForm
} from "../validations/users.js";
import {
	hashPassword
} from "../auth/auth.js";
import { sendMail } from "../functions/mail.js";

// Handle user registration
export const registerUser = (req, res) => {
	const user = req.body;

	try {
		// Validate the registration form
		validateRegisterForm(user)
			.then((response) => {
				// If response is true, hash the password
				if (response) {
					hashPassword(user.password)
						.then(async (hash) => {
							var {
								name,
								email
							} = user;
							const newUser = new User({
								name,
								email,
								password: hash,
							});

							// Save the user
							const savedUser = await newUser.save();
							const token = jwt.sign({
									id: savedUser._id,
									
								},
								process.env.JWT_SECRET_KEY
							);
							email = email.trim();
							sendMail({
								template:  "verify_email",
								author: "Comio Comics",
								email,
								title: "Verify your email",
								config: {
									name: name,
									action: "Sign up",
									owner: "MCADK",
									site: "Comio Comics",
									verification_link: process.env.apiUrl + 'verify_email/' + token,
									website: "https://comio-comics.app/",
									preheader: "Verify your email to get access of unlimited comics",
									logo: "https://github.com/MCADK1201/IMPORTANT_IMAGES/raw/main/comic-comics.png"
								}
							});
							res.status(201).json({
								_id: savedUser._id,
								email: savedUser.email,
								name: savedUser.name
							});
						})
						.catch((error) => {
							res.status(500).json({
								message: error.message
							});
						});
				}
				// But if response is false, show the error message
				else {
					res.status(400).json({
						message: errorMessage(),
					});
				}
			})
			.catch((error) => {
				res.status(500).json({
					message: error.message
				});
			});
	} catch (error) {
		res.status(500).json({
			message: error.message
		});
	}
};
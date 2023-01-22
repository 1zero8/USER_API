import { createTransport } from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import pkg from 'handlebars';
const { compile } = pkg;
import { readFile } from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

var readHTMLFile = function(path, callback) {
	readFile(path, {
		encoding: 'utf-8'
	}, function(err, html) {
		if (err) {
			callback(err);
		} else {
			callback(null, html);
		}
	});
};

const _smtpTransport = createTransport(smtpTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD
	}
}));

export const sendMail = (data = {}) => {
	readHTMLFile('./templates/' + data.template, function(err, html) {
		if (err) {
			return console.log('error reading file', err);
		}
		var template = compile(html);
		var htmlToSend = template(data.config)
		var mailOptions = {
			from: data.author,
			to: data.email,
			subject: data.title,
			html: htmlToSend
		};
		_smtpTransport.sendMail(mailOptions, function(error, response) {
			if (error) {
				return console.log('error send mail file', error);;
			} else {
				return console.log(`Successfully sent ${data.template} to ${data.email}`);;
			}
		});
	});
};
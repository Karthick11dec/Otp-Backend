const express = require('express');
const mongodb = require('mongodb');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// const DBURL = 'mongodb://127.0.0.1:27017';
const DBURL = process.env.DBURL || 'mongodb://127.0.0.1:27017';
const DATABASE = "Otp_Manager";
const COLLECTION = 'Otp';
const PORT = process.env.PORT || 5000;

const mongoClient = mongodb.MongoClient;

//opt is for control the registeration, before creating an account with any apps

const compare = (t1, t2) => {

	let m = Math.abs(parseInt(t2[0]) - parseInt(t1[0]));

	var a = "";

	if (m === 0) {
		if (t1[1] < t2[1] || t1[1] === t2[1]) {
			let r = t2[1] - t1[1]
			if (r <= 5 && t1[3] === t2[3]) {
				a = "valid";
			}
			else {
				a = "invalid";
			}
		}
	}
	else if (m === 1) {
		if ((t2[1] === "01" || t2[1] === "02" || t2[1] === "03" || t2[1] === "04") && t1[3] === t2[3]) {
			let h = 60 - parseInt(t1[1]);
			let a = h + parseInt(t2[1]);
			a = "valid";
		}
		else {
			a = "invalid";
		}
	}
	return a;
}
// compare([ '10', '37', '41', 'PM' ], [ '10', '38', '58', 'PM' ])

const validate = () => {
	let time = new Date().toLocaleTimeString().split(":");
	let [h, m, s] = time;
	let maradian = s.split(" ");
	const full = [h, m, maradian].flat(1);
	// console.log(full)
	return full;
}
// validate()

app.get('/', async (req, res) => {
	res.send("this is from our awesome otp backend server")
})

app.post('/generate', async (req, res) => {
	try {
		const client = await mongoClient.connect(DBURL);
		const db = client.db(DATABASE);
		const user = await db.collection(COLLECTION).findOne({ email: req.body.email });
		if (!user) {
			const otp = Math.random().toString(10).split('.')[1].slice(0, 6);
			await db.collection(COLLECTION).insertOne({ time: validate(), email: req.body.email, otp: otp });
			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.EMAIL,
					pass: process.env.PASSWORD,
				},
			});

			const mailOption = {
				from: process.env.EMAIL,
				to: req.body.email,
				subject: 'OTP Manager',
				text: 'Hi sir/madam',
				html: `
                       <p>Your OTP is for OTP Manager App is</p>
                       <h3>${otp}</h3>
                       <p>this OTP will be valid only <b>5 minutes</b> at the time of getting this mail</p>`
			};
			transporter.sendMail(mailOption, (err, data) => {
				if (data) {
					res.status(200).json({ message: 'created', data });
				} else if (err) {
					res.status(400).json({ err })
				}
			});
		} else {
			console.log('User already exist');
		}
	} catch (error) {
		res.status(400).json({ message: 'something went wrong' });
	}
});


app.post('/verify', async (req, res) => {
	try {
		const client = await mongoClient.connect(DBURL);
		const db = client.db(DATABASE);
		const user = await db.collection(COLLECTION).findOne({ email: req.body.email });
		if (user) {
			if (user.otp === req.body.otp && compare(user.time, req.body.time)) {
				await db.collection(COLLECTION).deleteOne({ email: req.body.email });
				res.status(200).json({ message: 'OTP Matched', result: true });
			} else {
				res.status(400).json({ message: 'Entered OTP is wrong or Otp timeOut', result: false });
			}
		} else {
			res.status(400).json({ message: 'Incorrect Email Id (or) OTP Already used once', result: false });
		}
	} catch (error) {
		console.log(error);
		res.json({ message: 'something went wrong' });
	}
});

app.listen(PORT, () => console.log(`:::server started on port ${PORT}:::`));

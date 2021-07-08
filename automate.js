//----------   requirements  ---------------/////////

const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const DBURL = process.env.DBURL || 'mongodb://127.0.0.1:27017';
const Database = "Otp_Manager";
const Docs = 'Otp';

//------------  Automate Cleaning process for delete expired Otp's    -----------///////////

const { verifyTime } = require("./verify");

const Automate = async () => {
    try {
        const client = await mongoClient.connect(DBURL);
        const db = client.db(Database);
        const user = await db.collection(Docs).find({ time: 1 }).toArray();
        // console.log(user)
        if (user.length > 0) {
            user.map(item => {
                let deletor = verifyTime(new Date().toLocaleTimeString(), item.time, item.expiry);
                if (deletor === "invalid") {
                    db.collection(Docs).findOneAndDelete({ _id: item._id })
                    console.log("successfully deleted...");
                }
                else {
                    console.log("no deletion...");
                }
            })
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { Automate };
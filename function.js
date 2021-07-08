const { Automate } = require("./automate");
const { expireTime } = require("./verify");

const initialTime = (t) => {
    let time = Extra(t);
    let c = Convert(time);
    return (c + parseInt(time[2]) + expireTime)
}
// initialTime(new date when genarate);

setInterval(() => {
    Automate();
    // console.log("setintervel");
}, 5000);

module.exports = { initialTime };
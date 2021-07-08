//Verify otp time------------------///////////////////

const expireTime = 300; //5 minutes otp expires

const Extra = (extra) => {
    let sec = extra.split(" ");
    return sec[0].split(":");
}//order the time

const Convert = (time) => {
    let hTOs = time[0] * 60 * 60;
    let mTOs = time[1] * 60;
    return (hTOs + mTOs);
}//convert to seconds

const multiply = (Value) => {
    let c = Convert(Value) + parseInt(Value[2]);
    return c;
}

//------------------  verification  ---------------------////////////////////

const verifyTime = (currentTime, olderTime, initialExpiry) => {

    let Current = []; Older = [];
    let ans = "";

    let CT = Extra(currentTime);
    let OT = Extra(olderTime);

    for (var i = 0; i < CT.length; i++) {
        Current.push(parseInt(CT[i]));
        Older.push(parseInt(OT[i]));
    }

    if ((Current[0] === 1 && Older[0] === 12) && Current[0] < Older[0]) { //when day change
        let direct = Math.abs(60 - Older[1]);
        Older[0] = 01;
        Older[1] = 00;
        Current[1] = Current[1] + direct;

        let oldTime = multiply(Older);
        let newTime = multiply(Current);

        let diff = Math.abs(oldTime - newTime);
        if (diff <= expireTime) {
            ans = "valid";
        }
        else if (diff >= expireTime) {
            ans = "invalid";
        }
        return ans;
    }
    else { //when normal
        let c = Convert(Current) + Current[2];
        let diff = Math.abs(initialExpiry - c);
        if (diff <= expireTime) {
            ans = "valid";
        }
        else if (diff >= expireTime) {
            ans = "invalid";
        }
        return ans;

    }
}

//----------------   genarate opt time   --------------- ////////////////////////

const initialTime = (t) => {
    let time = Extra(t);
    let c = Convert(time);
    return (c + parseInt(time[2]))
}

module.exports = { verifyTime, initialTime };
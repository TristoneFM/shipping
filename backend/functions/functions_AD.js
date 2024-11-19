const Functions_AD = {};
const ad = require('../connections/ad/connection_AD');




Functions_AD.AUTHENTICATE = async (username, password, req, res) => {
    try {

        //This promise returns True or False if there is an error it goes to the catch, else it just continues
        await new Promise((resolve, reject) => { 
            ad.authenticate(`TFT\\${username}`, password, (err, auth) => { err ? reject(err) : resolve(auth) }) 
        });

        const result = { username: username };
        const queryUserName = `sAMAccountName=${username}`
        const queryMESGroups = `CN=*.MES.*`
        //This promise returns the user information, if there is an error it goes to the catch, else it just continues
        const userSite_result = await new Promise((resolve, reject) => {
            ad.find(queryUserName, (err, userInfo) => {
                if (err) {return reject(err)}
                Promise.all([
                    new Promise((resolve, reject) => {
                        ad.findGroups(queryMESGroups, (err, mesGroups) => {
                            if (err) { return reject(err) }
                            resolve(mesGroups);
                        });
                    }),
                    new Promise((resolve, reject) => {
                        ad.getGroupMembershipForUser(username, (err, groupsForUser) => {
                            if (err) { return reject(err) }
                            resolve(groupsForUser);
                        });
                    })
                ]).then(([_mesGroups, _groupsForUser]) => {
                    const matchingGroups = _groupsForUser.filter(groupForUser =>
                        _mesGroups.some(group => group.cn === groupForUser.cn)
                    );
                    userInfo.groups = matchingGroups;
                    resolve(userInfo);
                }).catch(reject);
            });
        });
        //This creates a cookie that lasts 24 hours and sends it to the client
        const dnString = userSite_result.users[0].dn
        const matches = dnString.match(/OU=([^,]+)/g);
        let regexFindLocation = /^OU=[A-Z]{3}$/;
        const location = matches && matches.length >= 2 ? matches.filter(elemento => regexFindLocation.test(elemento))[0].split('=')[1].trim() : null;
        const index = userSite_result.groups.findIndex(group => group.dn.includes('.MES.'));
        let role = null;
        if (index !== -1) {
            role = userSite_result.groups[index].cn;
        }else{
            throw new Error("User not assigned to any MES group")
        }

        result.plant = location == "FRA" ? "DEL" : location;
        result.role = role;

        // const accessToken = jwt.sign(result, process.env.RFC_SECRET, { expiresIn: '1d' });
        // res.cookie('Tristone-Shipping', accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        return {
            authorization: "Authorized",
            data: userSite_result,
        };
    } catch (error) {
        throw {
            authorization: "Unauthorized",
            error: "Internal Server Error",
            error_description: error.message
        };
    }
};

Functions_AD.USERSFORGROUP = async (groupName) => {
    try {
        const usersForGroup_result = await new Promise((resolve, reject) => {
            ad.getUsersForGroup(groupName, (err, usersFG) => {
                usersFG ? resolve(usersFG) : reject(err)
            });
        });
        return usersForGroup_result;
    } catch (err) {
        throw err;
    }
}

Functions_AD.USERINFO = async (userName) => {
    try {
        const queryUserName = `sAMAccountName=${userName}`
        const queryMESGroups = `CN=*.MES.*`

        const userSite_result = await new Promise((resolve, reject) => {
            ad.find(queryUserName, (err, userInfo) => {
                if (err) {
                    return reject(err);
                }

                Promise.all([
                    new Promise((resolve, reject) => {
                        ad.findGroups(queryMESGroups, (err, mesGroups) => {
                            if (err) { return reject(err) }
                            resolve(mesGroups);
                        });
                    }),
                    new Promise((resolve, reject) => {
                        ad.getGroupMembershipForUser(userName, (err, groupsForUser) => {
                            if (err) { return reject(err) }
                            resolve(groupsForUser);
                        });
                    })
                ]).then(([_mesGroups, _groupsForUser]) => {
                    const matchingGroups = _groupsForUser.filter(groupForUser =>
                        _mesGroups.some(group => group.cn === groupForUser.cn)
                    );
                    userInfo.groups = matchingGroups;
                    resolve(userInfo);
                }).catch(reject);
            });
        });

        return userSite_result;
    } catch (err) {
        throw err;
    }
}




module.exports = Functions_AD;
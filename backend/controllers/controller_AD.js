const Functions_AD = require('../functions/functions_AD');

const controller_AD = {};

controller_AD.AUTHENTICATE = async (req, res) => {
    const username = req.body.username;
    const pwd = req.body.password;

    try {
        const auth_result = await Functions_AD.AUTHENTICATE(username, pwd, req, res);
        res.status(200).json(auth_result); // Respond with a JSON object
    } catch (err) {

        res.status(200).json( err ); // Respond with a JSON object
    }
};

controller_AD.USERSFORGROUP = async (req, res) => {
    try {
        const groupName = req.body.groupName;
        const ismemberof_result = await Functions_AD.USERSFORGROUP(groupName);
        res.status(200).json(ismemberof_result);
    } catch (err) {
        res.status(200).json(err);
    }
};

controller_AD.USERINFO = async (req, res) => {
    try {
        const username = req.body.username;
        const userinfo = await Functions_AD.USERINFO(username);
        res.status(200).json(userinfo);
    } catch (err) {
        res.status(200).json(err);
    }
};

module.exports = controller_AD;
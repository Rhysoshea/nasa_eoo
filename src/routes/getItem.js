const db = require('../persistence');

module.exports = async (req, res) => {
    const name = req.body.name;
    res.send(name);
};

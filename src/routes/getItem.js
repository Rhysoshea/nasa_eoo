const db = require('../persistence');

module.exports = async (req, res) => {
    // const name = req.body.name;
    const items = await db.getItem(req.body.name);
    res.send(items);
};

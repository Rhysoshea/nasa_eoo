const db = require('../persistence');

module.exports = async (req, res) => {
    const items = await db.getNames();
    res.send(items);
};

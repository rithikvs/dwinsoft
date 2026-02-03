const HandCash = require('../models/HandCash');

exports.getAllHandCash = async (req, res) => {
  try {
    const handCash = await HandCash.find();
    res.json(handCash);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hand cash records' });
  }
};

exports.createHandCash = async (req, res) => {
  try {
    const handCash = new HandCash(req.body);
    await handCash.save();
    res.status(201).json(handCash);
  } catch (err) {
    res.status(400).json({ message: 'Error creating hand cash record' });
  }
};

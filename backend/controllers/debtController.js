const Debt = require('../models/Debt');

exports.getAllDebts = async (req, res) => {
  try {
    const debts = await Debt.find();
    res.json(debts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching debts' });
  }
};

exports.createDebt = async (req, res) => {
  try {
    const debt = new Debt(req.body);
    await debt.save();
    res.status(201).json(debt);
  } catch (err) {
    res.status(400).json({ message: 'Error creating debt' });
  }
};

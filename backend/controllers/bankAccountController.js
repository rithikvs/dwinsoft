const BankAccount = require('../models/BankAccount');

exports.getAllBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bank accounts' });
  }
};

exports.createBankAccount = async (req, res) => {
  try {
    const account = new BankAccount(req.body);
    await account.save();
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ message: 'Error creating bank account' });
  }
};

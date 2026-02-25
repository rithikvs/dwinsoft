const BankAccount = require('../models/BankAccount');

exports.getAllBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find();
    res.json(accounts);
  } catch (err) {
    console.error('Error fetching bank accounts:', err);
    res.status(500).json({ message: 'Error fetching bank accounts', error: err.message });
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
exports.updateBankAccount = async (req, res) => {
  try {
    console.log(`Updating bank account ${req.params.id}`, req.body);
    const account = await BankAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (err) {
    console.error('Error updating bank account:', err);
    res.status(400).json({ message: 'Error updating bank account', error: err.message });
  }
};

exports.deleteBankAccount = async (req, res) => {
  try {
    console.log(`Attempting to delete bank account: ${req.params.id}`);
    const account = await BankAccount.findByIdAndDelete(req.params.id);
    if (!account) {
      console.log(`Bank account ${req.params.id} not found for deletion`);
      return res.status(404).json({ message: 'Account not found' });
    }
    console.log(`Bank account ${req.params.id} deleted successfully`);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting bank account:', err);
    res.status(500).json({ message: 'Error deleting bank account', error: err.message });
  }
};

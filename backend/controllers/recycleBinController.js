const DeletedTransaction = require('../models/DeletedTransaction');

exports.getDeletedTransactions = async (req, res) => {
  try {
    const deleted = await DeletedTransaction.find().sort({ deletedAt: -1 });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deleted transactions' });
  }
};

exports.addDeletedTransaction = async (transaction) => {
  try {
    const deleted = new DeletedTransaction({
      ...transaction,
      deletedAt: new Date(),
      originalId: transaction._id,
    });
    await deleted.save();
  } catch (err) {
    // Optionally log error
  }
};

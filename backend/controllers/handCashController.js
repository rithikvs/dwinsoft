const HandCash = require('../models/HandCash');

exports.getAllHandCash = async (req, res) => {
  try {
    const handCash = await HandCash.find().sort({ createdAt: -1 });
    res.json(handCash);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hand cash records' });
  }
};

exports.createHandCash = async (req, res) => {
  try {
    const { holder, amount, type, description } = req.body;
    
    if (!holder || !amount) {
      return res.status(400).json({ message: 'Holder and amount are required' });
    }

    const handCash = new HandCash({ 
      holder, 
      amount: Number(amount),
      type: type || 'Income',
      description 
    });
    await handCash.save();
    res.status(201).json(handCash);
  } catch (err) {
    res.status(400).json({ message: 'Error creating hand cash record', error: err.message });
  }
};

exports.getHandCashById = async (req, res) => {
  try {
    const handCash = await HandCash.findById(req.params.id);
    if (!handCash) {
      return res.status(404).json({ message: 'Hand cash record not found' });
    }
    res.json(handCash);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching hand cash record' });
  }
};

exports.updateHandCash = async (req, res) => {
  try {
    const { holder, amount, type, description } = req.body;
    
    if (!holder || !amount) {
      return res.status(400).json({ message: 'Holder and amount are required' });
    }

    const handCash = await HandCash.findByIdAndUpdate(
      req.params.id,
      { 
        holder, 
        amount: Number(amount),
        type: type || 'Income',
        description 
      },
      { new: true, runValidators: true }
    );

    if (!handCash) {
      return res.status(404).json({ message: 'Hand cash record not found' });
    }

    res.json(handCash);
  } catch (err) {
    res.status(400).json({ message: 'Error updating hand cash record', error: err.message });
  }
};

exports.deleteHandCash = async (req, res) => {
  try {
    const handCash = await HandCash.findByIdAndDelete(req.params.id);
    
    if (!handCash) {
      return res.status(404).json({ message: 'Hand cash record not found' });
    }

    res.json({ message: 'Hand cash record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting hand cash record' });
  }
};

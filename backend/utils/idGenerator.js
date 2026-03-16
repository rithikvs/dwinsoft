const User = require('../models/User');

/**
 * Generates the next employee ID based on role
 * Employee format: DSEMP01, DSEMP02, ... DSEMP99
 * HR format: DSHR01, DSHR02, ... DSHR99
 * @param {String} role - 'Employee' or 'HR'
 * @returns {String} - Generated ID
 */
const generateEmployeeId = async (role) => {
    try {
        let prefix = '';
        
        if (role === 'Employee') {
            prefix = 'DSEMP';
        } else if (role === 'HR') {
            prefix = 'DSHR';
        } else {
            return null; // ID not required for other roles
        }

        // Find all users with this role and extract the highest number
        const users = await User.find({ role, employeeId: { $exists: true, $ne: null } })
            .select('employeeId')
            .sort({ employeeId: -1 })
            .limit(1);

        let nextNumber = 1;

        if (users.length > 0) {
            const lastId = users[0].employeeId;
            // Extract the numeric part from the ID (e.g., "01" from "DSEMP01")
            const numericPart = lastId.replace(prefix, '');
            const currentNumber = parseInt(numericPart, 10);
            nextNumber = currentNumber + 1;
        }

        // Format with leading zeros (01, 02, ... 99)
        const formattedNumber = String(nextNumber).padStart(2, '0');
        const newId = `${prefix}${formattedNumber}`;

        return newId;
    } catch (err) {
        console.error('Error generating employee ID:', err.message);
        throw err;
    }
};

module.exports = { generateEmployeeId };

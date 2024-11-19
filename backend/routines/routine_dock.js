const DOCK_FUNCTION = {};
const schedule = require('node-schedule');
const FunctionsDB = require('../functions/functions_DB');

DOCK_FUNCTION.UPDATE = async () => {
    try {
        // Fetch all dock records
        const docks = await FunctionsDB.getAllDocks();
        
        // Iterate over each dock and update with a unique 10-digit random number
        for (const dock of docks) {
            const randomTenDigitNumber = Math.floor(1000000000 + Math.random() * 9000000000); // Generates a 10-digit number

            // Update each dock with its unique 10-digit number
            await FunctionsDB.updateDockNumber(dock.id, randomTenDigitNumber);
        }

        console.log('SHIPPING_DOCK table updated with unique dock numbers.');
    } catch (error) {
        console.error('Error updating SHIPPING_DOCK table:', error);
    }
};
  

const job = schedule.scheduleJob('*/10 * * * *', function() {
    DOCK_FUNCTION.UPDATE();
  });

  module.exports = DOCK_FUNCTION;
const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config({ path: 'd:/E-commerce/OCR/backend/.env' });
const Bill = require('d:/E-commerce/OCR/backend/src/models/Bill');
const { extractSingleBill } = require('d:/E-commerce/OCR/backend/src/services/extractionService');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Find all bills that have raw text stored
    const bills = await Bill.find({ rawExtractedText: { $exists: true, $ne: '' } });
    console.log(`Found ${bills.length} bills to inspect and migrate.`);
    
    let updatedCount = 0;
    for (const bill of bills) {
      const extracted = extractSingleBill(bill.rawExtractedText);
      const updates = {};
      
      if (extracted.supplierPlatform !== bill.supplierPlatform) {
        updates.supplierPlatform = extracted.supplierPlatform;
      }
      if (extracted.qty !== bill.qty) {
        updates.qty = extracted.qty;
      }
      if (extracted.amount !== bill.amount) {
        updates.amount = extracted.amount;
      }
      if (extracted.invoiceNumber !== bill.invoiceNumber) {
        updates.invoiceNumber = extracted.invoiceNumber;
      }
      if (extracted.orderNumber !== bill.orderNumber) {
        updates.orderNumber = extracted.orderNumber;
      }
      
      if (Object.keys(updates).length > 0) {
        console.log(`Updating Bill ${bill._id} | Invoice: ${bill.invoiceNumber || 'N/A'}`);
        console.log('Changes:', updates);
        await Bill.findByIdAndUpdate(bill._id, updates);
        updatedCount++;
      }
    }
    
    console.log(`✅ Migration complete: Updated ${updatedCount} out of ${bills.length} bills.`);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

migrate();

#!/usr/bin/env node
// scripts/send-reminders.js
// Manual script to trigger 24-hour appointment reminders
// For ImiRezervimi.al - Albanian Beauty Salon Booking Platform

const { triggerReminders } = require('../frontend/lib/scheduler');

async function main() {
  console.log('🕐 Starting manual reminder job...');
  
  try {
    const result = await triggerReminders();
    
    if (result.success) {
      console.log('✅ Reminders job completed successfully');
      console.log(`📊 Results: ${result.data?.data?.remindersSent || 0} sent, ${result.data?.data?.errors || 0} errors`);
      
      if (result.data?.data?.details?.length > 0) {
        console.log('\n📋 Details:');
        result.data.data.details.forEach((detail, index) => {
          console.log(`  ${index + 1}. ${detail.appointmentId}: ${detail.status}`);
          if (detail.error) {
            console.log(`     Error: ${detail.error}`);
          }
        });
      }
    } else {
      console.error('❌ Reminders job failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Failed to run reminders job:', error);
    process.exit(1);
  }
}

main();
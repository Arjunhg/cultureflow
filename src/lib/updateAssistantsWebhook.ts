import { getAllAssistants, updateAssistant } from '../actions/vapi';

// Function to update all existing VAPI assistants with webhook URL
export async function updateAllAssistantsWithWebhook() {
  try {
    console.log('🔄 Updating all VAPI assistants with webhook URL...');
    
    // Get all existing assistants
    const result = await getAllAssistants();
    
    if (!result.success || !result.data) {
      console.error('❌ Failed to fetch assistants:', result.message);
      return;
    }
    
    const assistants = result.data;
    console.log(`📋 Found ${assistants.length} assistants to update`);
    
    // Update each assistant with webhook URL
    for (const assistant of assistants) {
      try {
        console.log(`🔧 Updating assistant: ${assistant.name} (${assistant.id})`);
        
        const updateResult = await updateAssistant(assistant.id);
        
        if (updateResult.success) {
          console.log(`✅ Successfully updated ${assistant.name}`);
        } else {
          console.error(`❌ Failed to update ${assistant.name}:`, updateResult.message);
        }
      } catch (error) {
        console.error(`❌ Error updating ${assistant.name}:`, error);
      }
    }
    
    console.log('🎉 Finished updating all assistants with webhook URLs');
  } catch (error) {
    console.error('❌ Error in updateAllAssistantsWithWebhook:', error);
  }
}

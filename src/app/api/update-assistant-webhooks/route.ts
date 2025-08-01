import { NextResponse } from 'next/server';
import { getAllAssistants, updateAssistant } from '@/actions/vapi';

// Update all existing VAPI assistants with webhook URL
export async function POST() {
  try {
    console.log('🔄 [UPDATE ASSISTANTS] Starting webhook URL update for all assistants...');
    
    // Get all existing assistants
    const result = await getAllAssistants();
    
    if (!result.success || !result.data) {
      console.error('❌ [UPDATE ASSISTANTS] Failed to fetch assistants:', result.message);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch assistants',
        error: result.message
      }, { status: 500 });
    }
    
    const assistants = result.data;
    console.log(`📋 [UPDATE ASSISTANTS] Found ${assistants.length} assistants to update`);
    
    const updateResults = [];
    
    // Update each assistant with webhook URL
    for (const assistant of assistants) {
      try {
        console.log(`🔧 [UPDATE ASSISTANTS] Updating assistant: ${assistant.name} (${assistant.id})`);
        
        const updateResult = await updateAssistant(assistant.id);
        
        if (updateResult.success) {
          console.log(`✅ [UPDATE ASSISTANTS] Successfully updated ${assistant.name}`);
          updateResults.push({
            id: assistant.id,
            name: assistant.name,
            success: true
          });
        } else {
          console.error(`❌ [UPDATE ASSISTANTS] Failed to update ${assistant.name}:`, updateResult.message);
          console.error(`🔍 [UPDATE ASSISTANTS] Full error details:`, updateResult);
          updateResults.push({
            id: assistant.id,
            name: assistant.name,
            success: false,
            error: updateResult.message
          });
        }
      } catch (error) {
        console.error(`❌ [UPDATE ASSISTANTS] Error updating ${assistant.name}:`, error);
        updateResults.push({
          id: assistant.id,
          name: assistant.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const successCount = updateResults.filter(r => r.success).length;
    const failureCount = updateResults.filter(r => !r.success).length;
    
    console.log(`🎉 [UPDATE ASSISTANTS] Finished: ${successCount} successful, ${failureCount} failed`);
    
    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} assistants with webhook URLs`,
      totalAssistants: assistants.length,
      successCount,
      failureCount,
      results: updateResults,
      webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vapi-webhook`
    });
    
  } catch (error) {
    console.error('❌ [UPDATE ASSISTANTS] Error in updateAllAssistantsWithWebhook:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update assistants with webhook URLs',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Allow GET requests to check the endpoint
export async function GET() {
  return NextResponse.json({
    message: 'VAPI Assistant Webhook Update Endpoint',
    description: 'Use POST to update all assistants with webhook URLs',
    webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vapi-webhook`
  });
}

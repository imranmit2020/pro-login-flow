export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'ElevenLabs API key not configured' 
      });
    }

    console.log('Starting comprehensive reset...');

    // First, get all history items
    const historyResponse = await fetch('https://api.elevenlabs.io/v1/history', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey
      }
    });

    console.log('History response status:', historyResponse.status);

    if (!historyResponse.ok) {
      const errorText = await historyResponse.text();
      console.error('Failed to fetch history:', errorText);
      throw new Error(`Failed to fetch history: ${historyResponse.status} - ${errorText}`);
    }

    const historyData = await historyResponse.json();
    console.log('History data structure:', JSON.stringify(historyData, null, 2));
    
    const historyItems = historyData.history || [];
    console.log(`Found ${historyItems.length} history items to delete`);

    // Also get all conversations for ConvAI
    console.log('Fetching conversations...');
    let allConversations = [];
    let nextCursor = null;
    const pageSize = 100;

    do {
      const conversationUrl = nextCursor
        ? `https://api.elevenlabs.io/v1/convai/conversations?page_size=${pageSize}&cursor=${encodeURIComponent(nextCursor)}`
        : `https://api.elevenlabs.io/v1/convai/conversations?page_size=${pageSize}`;
      
      const conversationResponse = await fetch(conversationUrl, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey
        }
      });

      if (conversationResponse.ok) {
        const conversationData = await conversationResponse.json();
        allConversations = allConversations.concat(conversationData.conversations || []);
        nextCursor = conversationData.has_more ? conversationData.next_cursor : null;
      } else {
        console.log('Could not fetch conversations:', conversationResponse.status);
        break;
      }
    } while (nextCursor);

    console.log(`Found ${allConversations.length} conversations to delete`);

    if (historyItems.length === 0 && allConversations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No history items or conversations to delete.',
        deletedCount: 0,
        failedCount: 0,
        totalItems: 0
      });
    }

    // Delete each history item one by one with delay to avoid rate limiting
    const deleteResults = [];
    
    // Delete history items first
    for (let i = 0; i < historyItems.length; i++) {
      const item = historyItems[i];
      console.log(`Deleting history item ${i + 1}/${historyItems.length}: ${item.history_item_id}`);
      
      try {
        const deleteResponse = await fetch(`https://api.elevenlabs.io/v1/history/${item.history_item_id}`, {
          method: 'DELETE',
          headers: {
            'xi-api-key': apiKey
          }
        });

        console.log(`Delete response for ${item.history_item_id}:`, deleteResponse.status);

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error(`Failed to delete history item ${item.history_item_id}: ${deleteResponse.status} - ${errorText}`);
          deleteResults.push({ success: false, itemId: item.history_item_id, error: errorText, type: 'history' });
        } else {
          console.log(`Successfully deleted history item ${item.history_item_id}`);
          deleteResults.push({ success: true, itemId: item.history_item_id, type: 'history' });
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error deleting history item ${item.history_item_id}:`, error);
        deleteResults.push({ success: false, itemId: item.history_item_id, error: error.message, type: 'history' });
      }
    }

    // Delete conversations
    for (let i = 0; i < allConversations.length; i++) {
      const conversation = allConversations[i];
      console.log(`Deleting conversation ${i + 1}/${allConversations.length}: ${conversation.conversation_id}`);
      
      try {
        const deleteResponse = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversation.conversation_id}`, {
          method: 'DELETE',
          headers: {
            'xi-api-key': apiKey
          }
        });

        console.log(`Delete response for conversation ${conversation.conversation_id}:`, deleteResponse.status);

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error(`Failed to delete conversation ${conversation.conversation_id}: ${deleteResponse.status} - ${errorText}`);
          deleteResults.push({ success: false, itemId: conversation.conversation_id, error: errorText, type: 'conversation' });
        } else {
          console.log(`Successfully deleted conversation ${conversation.conversation_id}`);
          deleteResults.push({ success: true, itemId: conversation.conversation_id, type: 'conversation' });
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error deleting conversation ${conversation.conversation_id}:`, error);
        deleteResults.push({ success: false, itemId: conversation.conversation_id, error: error.message, type: 'conversation' });
      }
    }

    const successfulDeletes = deleteResults.filter(result => result.success).length;
    const failedDeletes = deleteResults.filter(result => !result.success).length;
    const historyDeletes = deleteResults.filter(result => result.type === 'history' && result.success).length;
    const conversationDeletes = deleteResults.filter(result => result.type === 'conversation' && result.success).length;

    console.log(`Delete operation completed: ${successfulDeletes} successful (${historyDeletes} history + ${conversationDeletes} conversations), ${failedDeletes} failed`);

    // After deleting history, let's check the current subscription status
    console.log('Checking subscription status after deletion...');
    try {
      const subscriptionResponse = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
        headers: {
          'xi-api-key': apiKey,
        },
      });

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        console.log('Current subscription data after deletion:', JSON.stringify(subscriptionData, null, 2));
      }
    } catch (error) {
      console.log('Could not fetch subscription data:', error.message);
    }

    res.status(200).json({
      success: true,
      message: `Reset completed. ${successfulDeletes} items deleted successfully (${historyDeletes} history items + ${conversationDeletes} conversations)${failedDeletes > 0 ? `, ${failedDeletes} failed` : ''}.${historyItems.length === 0 && allConversations.length === 0 ? ' Note: No items were found - data may already be reset or take time to update.' : ''}`,
      deletedCount: successfulDeletes,
      failedCount: failedDeletes,
      totalItems: historyItems.length + allConversations.length,
      historyDeleted: historyDeletes,
      conversationsDeleted: conversationDeletes,
      details: deleteResults,
      note: (historyItems.length === 0 && allConversations.length === 0) ? 'No data found - everything should be reset' : 'Data reset complete - dashboard should show 0 calls and reset credits'
    });

  } catch (error) {
    console.error('Error resetting ElevenLabs history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset ElevenLabs history'
    });
  }
}

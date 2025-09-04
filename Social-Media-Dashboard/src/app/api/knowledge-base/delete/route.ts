import { NextRequest, NextResponse } from 'next/server';

// Pinecone configuration
const PINECONE_HOST = 'https://smilexpert-f1vw0q7.svc.aped-4627-b74a.pinecone.io';
const PINECONE_NAMESPACE = ''; // Empty string for default namespace in older API versions

export async function DELETE(request: NextRequest) {
  try {
    // Get Pinecone API key from environment variables
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    
    if (!pineconeApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Pinecone API key not configured',
        message: 'Please configure PINECONE_API_KEY in environment variables'
      }, { status: 500 });
    }

    console.log('🗑️ Starting Pinecone knowledge base deletion...');

    // Delete all vectors from the specified namespace
    // For older API versions, we handle the default namespace differently
    const requestBody: { deleteAll: boolean; namespace?: string } = {
      deleteAll: true
    };
    
    // Only include namespace if it's not empty (for compatibility with older API versions)
    if (PINECONE_NAMESPACE.length > 0) {
      requestBody.namespace = PINECONE_NAMESPACE;
    }
    
    const deleteResponse = await fetch(`${PINECONE_HOST}/vectors/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': pineconeApiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json().catch(() => ({ message: 'Unknown error' }));
      console.error('❌ Pinecone deletion failed:', errorData);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to delete knowledge base',
        message: errorData.message || `HTTP ${deleteResponse.status}: ${deleteResponse.statusText}`,
        details: errorData
      }, { status: deleteResponse.status });
    }

    console.log('✅ Pinecone knowledge base deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Knowledge base deleted successfully',
      namespace: PINECONE_NAMESPACE || 'default',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error deleting knowledge base:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 
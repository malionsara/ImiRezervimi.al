// frontend/pages/api/auth/deauthorize.js
// Instagram deauthorization callback for GDPR compliance

export default function handler(req, res) {
  // Instagram deauthorization callback
  // This endpoint is required by Instagram Basic Display API for GDPR compliance
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the deauthorization request
    console.log('Instagram deauthorization request received:', {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    // In a production app, you would:
    // 1. Verify the request is from Instagram
    // 2. Delete user data associated with the Instagram user ID
    // 3. Log the deauthorization for compliance
    
    // For now, just acknowledge the request
    return res.status(200).json({
      success: true,
      message: 'Deauthorization request processed'
    });

  } catch (error) {
    console.error('Deauthorization error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
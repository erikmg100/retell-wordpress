// api/create-web-call.js - FORCE REDEPLOY v2
// ALLOWING ALL ORIGINS FOR TESTING

export default async function handler(req, res) {
  // Log the request for debugging
  console.log('Request received from:', req.headers.origin);
  
  // Allow ALL origins - no restrictions for testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const RETELL_API_KEY = process.env.RETELL_API_KEY;
    
    if (!RETELL_API_KEY) {
      return res.status(500).json({ error: 'Retell API key not configured' });
    }
    
    const { agent_id, metadata, retell_llm_dynamic_variables } = req.body;
    
    if (!agent_id) {
      return res.status(400).json({ error: 'agent_id is required' });
    }
    
    // Create web call with Retell API
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id,
        metadata: metadata || {},
        retell_llm_dynamic_variables: retell_llm_dynamic_variables || {},
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData });
    }
    
    const data = await response.json();
    
    res.status(200).json({
      access_token: data.access_token,
      call_id: data.call_id,
    });
    
  } catch (error) {
    console.error('Error creating web call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

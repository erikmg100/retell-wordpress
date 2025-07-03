// api/create-web-call.js
// This file goes in your Vercel project's api directory

export default async function handler(req, res) {
  // Enable CORS for your WordPress domain
  const allowedOrigins = [
    'https://meetgabbi.com',
    'https://www.meetgabbi.com',
    'http://localhost:3000', // For local testing
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Your Retell API key should be stored as an environment variable
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
    
    // Return the access token and call ID to the frontend
    res.status(200).json({
      access_token: data.access_token,
      call_id: data.call_id,
    });
    
  } catch (error) {
    console.error('Error creating web call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

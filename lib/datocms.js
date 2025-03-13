// lib/datocms.js

export async function fetchFromDatoCMS({
    query,
    variables = {},
    includeDrafts = false,
    excludeInvalid = false,
  }) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN}`,
    };
  
    if (includeDrafts) {
      headers['X-Include-Drafts'] = 'true';
    }
    
    if (excludeInvalid) {
      headers['X-Exclude-Invalid'] = 'true';
    }
  
    try {
      const response = await fetch('https://graphql.datocms.com/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
      });
  
      const responseBody = await response.json();
  
      if (responseBody.errors) {
        throw new Error(
          `DatoCMS API Error: ${responseBody.errors.map(e => e.message).join(', ')}`
        );
      }
  
      console.log("Data fetched from DatoCMS:", responseBody.data);
      
      return responseBody.data;
    } catch (error) {
      console.error('Error fetching from DatoCMS:', error);
      throw error;
    }
  }
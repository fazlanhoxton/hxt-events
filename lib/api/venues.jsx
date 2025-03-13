import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://app.guestmanager.com/api/public/v2/venues?include=address', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.GUEST_MANAGER_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Guest Manager API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching venues from Guest Manager:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}

export async function createVenue(venueData) {
  try {
    console.log('Creating new venue:', venueData);
    const response = await fetch('https://app.guestmanager.com/api/public/v2/venues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.NEXT_PUBLIC_GUEST_MANAGER_AUTH_TOKEN}`,
      },
      body: JSON.stringify(venueData),
    });

    if (!response.ok) {
      let errorText = '';
      try {
        const errorResponse = await response.json();
        errorText = JSON.stringify(errorResponse);
      } catch (e) {
        errorText = await response.text();
      }
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating venue:', error);
    throw error;
  }
}

export async function getVenues(params = {}) {
  try {
    // Default parameters
    const pageNumber = params.pageNumber || 1;
    const pageSize = params.pageSize || 10;
    const searchQuery = params.search || '';

    console.log(`Fetching venues from API (page ${pageNumber})...`);

    // Build the URL with required parameters
    let url = `https://app.guestmanager.com/api/public/v2/venues?include=address&page[number]=${pageNumber}&page[size]=${pageSize}`;

    // Add search query if provided - Use filter[query] instead of filter[name]
    if (searchQuery) {
      // Based on error message, 'name' is not a valid filter parameter
      // Try using the generic 'query' filter instead
      url += `&filter[query]=${encodeURIComponent(searchQuery)}`;
    }

    console.log("API request URL:", url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.NEXT_PUBLIC_GUEST_MANAGER_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      // Try to parse the error response
      let errorText = '';
      try {
        const errorResponse = await response.json();
        errorText = JSON.stringify(errorResponse);
        console.error('API error details:', errorResponse);
      } catch (e) {
        errorText = await response.text();
      }
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('API response pagination:', data.meta?.page);
    return data;
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
}

// // In /lib/api/venues.js
// export async function fetchVenues() {
//   // Replace with your actual API endpoint
//   const response = await fetch('/api/guest-manager/venues');

//   if (!response.ok) {
//     throw new Error('Failed to fetch venues');
//   }

//   const data = await response.json();
//   return data.venues; // Adjust based on your API response structure
// }

// lib/api/venues.js
export async function fetchGuestManagerVenues() {
  try {
    // For development, use mock data instead of calling an API that doesn't exist yet
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock venues from Guest Manager
    return [
      { id: "gm-venue-1", name: "Grand Ballroom", capacity: 500, location: "Main Building" },
      { id: "gm-venue-2", name: "Conference Center", capacity: 300, location: "East Wing" },
      { id: "gm-venue-3", name: "Exhibition Hall", capacity: 1000, location: "South Wing" },
      { id: "gm-venue-4", name: "Rooftop Garden", capacity: 150, location: "Penthouse" },
      { id: "gm-venue-5", name: "Beachfront Pavilion", capacity: 200, location: "Oceanside" }
    ];
    
    /* 
    // When the actual API is ready, replace the mock with this:
    const response = await fetch('/api/guest-manager/venues');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch venues: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.venues || [];
    */
  } catch (error) {
    console.error('Error fetching Guest Manager venues:', error);
    throw error;
  }
}
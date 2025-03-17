// app/api/venues/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const pageNumber = searchParams.get('pageNumber') || 1;
    const pageSize = searchParams.get('pageSize') || 10;
    const search = searchParams.get('search') || '';
    
    // Build URL with correct pagination parameters using square brackets
    let url = `https://app.guestmanager.com/api/public/v2/venues?include=address`;
    
    // Add pagination params using the correct format with square brackets
    url += `&page[number]=${pageNumber}&page[size]=${pageSize}`;
    
    if (search) {
      url += `&filter[query]=${encodeURIComponent(search)}`;
    }
    
    console.log('Server: Requesting Guest Manager API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Server-side environment variable
        'Authorization': `Token ${process.env.NEXT_PUBLIC_GUEST_MANAGER_AUTH_TOKEN}`,
      },
    });

    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
        console.error('API error details:', errorData);
      } catch (e) {
        errorText = await response.text();
      }
      
      return NextResponse.json(
        { error: `Guest Manager API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in venues API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const venueData = await request.json();
    
    const response = await fetch('https://app.guestmanager.com/api/public/v2/venues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Server-side environment variable
        'Authorization': `Token ${process.env.NEXT_PUBLIC_GUEST_MANAGER_AUTH_TOKEN}`,
      },
      body: JSON.stringify(venueData),
    });

    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch (e) {
        errorText = await response.text();
      }
      
      return NextResponse.json(
        { error: `Guest Manager API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { error: 'Failed to create venue' }, 
      { status: 500 }
    );
  }
}
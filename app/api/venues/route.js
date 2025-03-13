// app/api/venues/route.js
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
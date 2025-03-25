// lib/api/events.js

import { fetchFromDatoCMS } from "../datocms";

/**
 * Fetches all events from DatoCMS
 * @returns {Promise<Array>} Array of event objects
 * @throws {Error} If fetching fails
 */
export async function fetchEventsFromDatoCMS() {
  try {
    // Query matches ONLY the fields that exist in your DatoCMS schema
    const query = `
      query AllEvents {
        allEvents {
          id
          defaultScId
          eventIdGuestManager
          eventName
          endDateAndTime
          startDateAndTime
        }
      }
    `;

    // Check if API token is available
    if (!process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN) {
      throw new Error(
        "DatoCMS API token not found. Please set NEXT_PUBLIC_DATOCMS_API_TOKEN in your environment variables."
      );
    }

    const data = await fetchFromDatoCMS({ query });

    if (!data || !data.allEvents) {
      throw new Error("Invalid data structure received from DatoCMS");
    }

    // Transform the data to match what your UI expects
    const transformedEvents = data.allEvents.map((event) => {
      // Helper function to format date (defined inside map to access it easily)
      const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);

        // Format year, month, day
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");

        // Format hours, minutes, seconds
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
        const seconds = String(date.getUTCSeconds()).padStart(2, "0");

        // Return formatted date
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
      };

      // Format the date for display
      const formattedDate = formatDate(event.endDateAndTime);

      // Use the original date object for comparison
      const endDate = new Date(event.endDateAndTime);

      return {
        id: event.id,
        name: event.eventName || "Unnamed Event",
        guestManagerId: event.eventIdGuestManager || "-",
        defaultScId: event.defaultScId || "-",
        date: formattedDate, // Use the formatted date
        status: endDate <= new Date() ? "Completed" : "Upcoming" || "-",
        venue: "-",
        attendeeCount: 0,
      };
    });

    return transformedEvents;
  } catch (error) {
    console.error("Error fetching events from DatoCMS:", error);
    throw new Error(`Failed to fetch events: ${error.message}`);
  }
}

/**
 * Creates a new event in DatoCMS
 * @param {Object} eventData - The event data to create
 * @returns {Promise<Object>} The created event
 * @throws {Error} If creation fails
 */
export async function createEvent(eventData) {
  if (!process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN) {
    throw new Error(
      "DatoCMS API token not found. Please set NEXT_PUBLIC_DATOCMS_API_TOKEN in your environment variables."
    );
  }

  // Create mutation with only the fields that exist in your schema
  const mutation = `
    mutation CreateEvent(
      $eventName: String!
      $eventIdGuestManager: String!
      $defaultScId: String
    ) {
      createEvent(
        data: {
          eventName: $eventName
          eventIdGuestManager: $eventIdGuestManager
          defaultScId: $defaultScId
        }
      ) {
        id
        defaultScId
        eventIdGuestManager
        eventName
      }
    }
  `;

  try {
    // Map form data to what your API expects
    const variables = {
      eventName: eventData.name || eventData.eventName,
      eventIdGuestManager:
        eventData.guestManagerId ||
        eventData.eventIdGuestManager ||
        `GM-${Date.now()}`,
      defaultScId: eventData.defaultScId || null,
    };

    const data = await fetchFromDatoCMS({ query: mutation, variables });

    if (!data || !data.createEvent) {
      throw new Error("Failed to create event in DatoCMS");
    }

    // Transform response to match UI expectations
    return {
      id: data.createEvent.id,
      name: data.createEvent.eventName,
      guestManagerId: data.createEvent.eventIdGuestManager,
      defaultScId: data.createEvent.defaultScId,
      // Provide default values for fields needed by UI
      date: new Date().toISOString(),
      status: "upcoming",
      venue: "-",
      attendeeCount: 0,
      description: "-",
    };
  } catch (error) {
    console.error("Error creating event in DatoCMS:", error);
    throw new Error(`Failed to create event: ${error.message}`);
  }
}

/**
 * Fetches attendee counts for an event with proper pagination to handle more than 50 records
 */
async function fetchEventAttendeeCount(eventId, apiToken) {
  try {
    let allTickets = [];
    let currentPage = 1;
    let hasMorePages = true;
    
    // Continue fetching pages until we've got all tickets
    while (hasMorePages) {
      // Fetch current page of tickets for this event
      const response = await fetch(
        `https://app.guestmanager.com/api/public/v2/tickets?filter[event_ids]=${eventId}&page[size]=50&page[number]=${currentPage}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch attendees for event ${eventId} (page ${currentPage})`);
        break;
      }

      const data = await response.json();
      const tickets = data.data || [];
      
      // Add this page's tickets to our collection
      allTickets = [...allTickets, ...tickets];
      
      // Check if we need to fetch more pages
      if (tickets.length < 50) {
        hasMorePages = false; // No more pages if we got fewer than the max records
      } else {
        currentPage++; // Move to next page
      }
    }

    // Count tickets by status
    const registeredCount = allTickets.filter(ticket => ticket.status === "confirmed").length;
    const attendedCount = allTickets.filter(ticket => ticket.status === "checked_in").length;

    console.log(`Event ${eventId}: Found ${allTickets.length} total tickets (${registeredCount} registered, ${attendedCount} checked in)`);

    return { registeredCount, attendedCount };
  } catch (error) {
    console.error(`Error fetching attendee count for event ${eventId}:`, error);
    return { registeredCount: 0, attendedCount: 0 };
  }
}

export async function fetchEventsFromGuestManager() {
  const API_TOKEN = process.env.NEXT_PUBLIC_GUEST_MANAGER_AUTH_TOKEN;

  if (!API_TOKEN) {
    throw new Error("Missing API Token! Check .env.local");
  }

  try {
    // Get all events by making multiple API calls if needed
    let allEvents = [];
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      const response = await fetch(
        `https://app.guestmanager.com/api/public/v2/events?page[number]=${currentPage}&page[size]=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.status}`);
      }

      const data = await response.json();
      const events = data.data || [];
      
      // Add this page's events to our collection
      allEvents = [...allEvents, ...events];
      
      // Check if we need to fetch more pages
      if (events.length < 10) {
        hasMorePages = false; // No more pages if we got fewer than the max records
      } else {
        currentPage++; // Move to next page
      }
    }

    // Continue with your existing code to enrich events with venue details
    const enrichedEvents = await Promise.all(
      allEvents.map(async (event) => {
        // Your existing code for enriching events with venue details
        // This code already fetches venue country correctly
        let venueName = "N/A";
        let venueCountry = "N/A";
        if (event.venue_id) {
          try {
            const venueResponse = await fetch(
              `https://app.guestmanager.com/api/public/v2/venues/${event.venue_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${API_TOKEN}`,
                },
              }
            );
            if (venueResponse.ok) {
              const venueData = await venueResponse.json();
              venueName = venueData.name || "Unknown Venue";
              venueCountry = venueData.address.country_name || "Unknown Country";
            }
          } catch (venueError) {
            console.error("Error fetching venue:", venueError);
          }
        }
        
        // Rest of your existing enrichment code...
        const attendeeCount = await fetchEventAttendeeCount(event.id, API_TOKEN);
        const eventEndDate = new Date(event.end.local);
        const status = eventEndDate >= new Date() ? "Upcoming" : "Completed";

        return {
          id: event.id,
          name: event.name,
          starts_at: event.start.local,
          ends_at: event.end.local,
          guestManagerId: event.id,
          venue: venueName,
          status: status,
          county: venueCountry,
          registeredCount: attendeeCount.registeredCount,
          attendeeCount: attendeeCount.attendedCount,
        };
      })
    );

    return enrichedEvents;
  } catch (error) {
    console.error("Failed to fetch events from Guest Manager:", error);
    return [];
  }
}

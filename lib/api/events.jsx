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

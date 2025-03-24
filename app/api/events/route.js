export async function POST(req) {
  console.log(req.body);

  try {
    const body = await req.json();

    if (!body.starts_at || !body.ends_at) {
      throw new Error("Missing start or end date.");
    }

    const API_TOKEN = process.env.NEXT_PUBLIC_GUEST_MANAGER_AUTH_TOKEN;
    if (!API_TOKEN) {
      throw new Error("Missing API Token! Check .env.local");
    }

    // Prepare Guest Manager request data (only allowed fields)
    const guestManagerData = {
      name: body.name,
      starts_at: body.starts_at,
      ends_at: body.ends_at,
      venue_id: body.venue_id,
      sc_id: body.sc_id,
    };

    // 🔹 Step 1: Create Event in Guest Manager
    const gmResponse = await fetch(
      "https://app.guestmanager.com/api/public/v2/events/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(guestManagerData),
      }
    );

    if (!gmResponse.ok) {
      const errorText = await gmResponse.text();
      throw new Error(
        `Guest Manager API error: ${gmResponse.status} - ${errorText}`
      );
    }

    const eventData = await gmResponse.json();
    console.log("✅ Event Created in Guest Manager:", eventData);

    // 🔹 Step 2: Create Item in DatoCMS using JSON:API format
    const DATO_API_TOKEN = process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN;
    if (!DATO_API_TOKEN) {
      throw new Error("Missing DatoCMS API Token! Check .env.local");
    }

    const slug = `${body.name.toLowerCase().replace(/\s+/g, "-")}`;

    // Prepare the JSON:API formatted request for DatoCMS
    const datoRequestBody = {
      data: {
        type: "item",
        attributes: {
          event_name: eventData.name,
          default_sc_id: body.sc_id,
          event_id_guest_manager: eventData.id.toString(),
          slug: slug,
          created_at: eventData.created_at,
        },
        relationships: {
          item_type: {
            data: {
              id: "egMSN5CuQquIDNV6P_lAKQ", // Your model ID
              type: "item_type",
            },
          },
        },
      },
    };

    const datoResponse = await fetch("https://site-api.datocms.com/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${DATO_API_TOKEN}`,
        Accept: "application/vnd.api+json",
        "X-Api-Version": "3",
      },
      body: JSON.stringify(datoRequestBody),
    });

    if (!datoResponse.ok) {
      const datoError = await datoResponse.text();
      throw new Error(
        `DatoCMS API error: ${datoResponse.status} - ${datoError}`
      );
    }

    const datoData = await datoResponse.json();
    console.log("✅ Event Created in DatoCMS:", datoData);

    // 🔹 Fetch Venue Details for the Event
    const venueId = eventData.venue_id; // Ensure venue_id exists
    let countyName = "Unknown";

    if (venueId) {
      const venueResponse = await fetch(
        `https://app.guestmanager.com/api/public/v2/venues/${venueId}`,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );

      if (venueResponse.ok) {
        const venueData = await venueResponse.json();
        countyName = venueData.county?.name || "Unknown";
      }
    }

    // 🔹 Return event with county information and DatoCMS data
    return new Response(
      JSON.stringify({
        ...eventData,
        county: countyName,
        datoCmsData: {
          id: datoData?.data?.id,
          slug: slug,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("API Request Failed:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

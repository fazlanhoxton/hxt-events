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

        // 🔹 Step 1: Create Event in Guest Manager
        const gmResponse = await fetch("https://app.guestmanager.com/api/public/v2/events/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        if (!gmResponse.ok) {
            const errorText = await gmResponse.text();
            throw new Error(`Guest Manager API error: ${gmResponse.status} - ${errorText}`);
        }

        const eventData = await gmResponse.json();
        console.log("✅ Event Created in Guest Manager:", eventData);

        // 🔹 Step 2: Create Item in DatoCMS using JSON:API format
        const DATO_API_TOKEN = process.env.NEXT_PUBLIC_DATOCMS_API_TOKEN;
        if (!DATO_API_TOKEN) {
            throw new Error("Missing DatoCMS API Token! Check .env.local");
        }

        // Prepare the JSON:API formatted request for DatoCMS
        const datoRequestBody = {
            data: {
                type: "item",
                attributes: {
                    event_name: eventData.name,
                    default_sc_id: body.sc_id, 
                    event_id_guest_manager: eventData.id.toString(),
                    start_date_and_time: body.starts_at,
                    end_date_and_time: body.ends_at,
                    created_at: eventData.created_at
                },
                relationships: {
                    item_type: {
                        data: {
                            id: "egMSN5CuQquIDNV6P_lAKQ", // Your model ID
                            type: "item_type"
                        }
                    }
                }
            }
        };

        const datoResponse = await fetch("https://site-api.datocms.com/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/vnd.api+json",
                "Authorization": `Bearer ${DATO_API_TOKEN}`,
                "Accept": "application/vnd.api+json",
                "X-Api-Version": "3"
            },
            body: JSON.stringify(datoRequestBody)
        });

        if (!datoResponse.ok) {
            const datoError = await datoResponse.text();
            throw new Error(`DatoCMS API error: ${datoResponse.status} - ${datoError}`);
        }

        const datoData = await datoResponse.json();
        console.log("✅ Event Created in DatoCMS:", datoData);

        return new Response(JSON.stringify({ eventData, datoData }), { status: 200 });

    } catch (error) {
        console.error("API Request Failed:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
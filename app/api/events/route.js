export async function POST(req) {
    console.log("Received request body:", req);
    alert();
    try {
        const body = await req.json();
        
        // Debugging logs
        console.log("Received request body:", body);

        if (!body.starts_at || !body.end_at) {
            throw new Error("Missing start or end date.");
        }

        const API_TOKEN = process.env.NEXT_PUBLIC_GUEST_MANAGER_AUTH_TOKEN;
        if (!API_TOKEN) {
            throw new Error("Missing API Token! Check .env.local");
        }

        const response = await fetch("https://app.guestmanager.com/api/public/v2/events/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_TOKEN}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Guest Manager API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error("API Request Failed:", error.message);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

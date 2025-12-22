
const { createClient } = require("@supabase/supabase-js")
const dotenv = require("dotenv")
dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log("Fetching payment_requests with join...")
    const { data: requests, error } = await supabase
        .from("payment_requests")
        .select(`
            id,
            amount,
            student_id,
            debt_id,
            student:profiles(full_name),
            debt:debts(id, amount_owed)
        `)
        .limit(1)

    if (error) {
        console.error("Error:", error)
        return
    }

    console.log("Data structure of first request:")
    console.log(JSON.stringify(requests?.[0], null, 2))
}

debug()

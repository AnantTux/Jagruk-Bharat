export async function sendAuthEmail({ to, subject, text }) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.AUTH_EMAIL_FROM;
    if (!apiKey || !from)
        return { delivered: false };

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "Jagruk Bharat/0.1",
        },
        body: JSON.stringify({ from, to: [to], subject, text }),
    });
    if (!response.ok)
        throw new Error("Email delivery failed.");
    return { delivered: true };
}

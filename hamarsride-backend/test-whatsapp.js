const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

client.messages
  .create({
    from: "whatsapp:+14155238886",
    to: "whatsapp:+2347043640694",
    body: "Test message from HamarsRide backend 🚀",
  })
  .then(msg => console.log("SUCCESS:", msg.sid))
  .catch(err => console.error("ERROR:", err.message));

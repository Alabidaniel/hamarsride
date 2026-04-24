const normalizePhone = (value) => {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";

  const defaultCountryCode = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || "").replace(/[^\d+]/g, "");
  const digitsOnly = trimmed.replace(/[^\d]/g, "");

  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/[^\d]/g, "")}`;
  }

  if (defaultCountryCode) {
    const normalizedCode = defaultCountryCode.startsWith("+")
      ? defaultCountryCode
      : `+${defaultCountryCode}`;
    if (digitsOnly.startsWith("0")) {
      return `${normalizedCode}${digitsOnly.slice(1)}`;
    }
    return `${normalizedCode}${digitsOnly}`;
  }

  return "";
};

const collectRecipients = (adminUsers) => {
  const fromEnv = (process.env.ADMIN_WHATSAPP_NUMBERS || "")
    .split(",")
    .map((value) => normalizePhone(value))
    .filter(Boolean);

  const fromAdmins = (adminUsers || [])
    .map((user) => normalizePhone(user.phone))
    .filter(Boolean);

  return [...new Set([...fromEnv, ...fromAdmins])];
};

const sendWhatsAppMessage = async ({ to, message }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = normalizePhone(process.env.TWILIO_WHATSAPP_FROM || "");

  if (!accountSid || !authToken || !fromNumber) {
    return false;
  }

  if (typeof fetch !== "function") {
    console.error("Global fetch is not available. WhatsApp alerts are disabled.");
    return false;
  }

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const body = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: `whatsapp:${fromNumber}`,
    Body: message,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Twilio WhatsApp request failed (${response.status}): ${details}`);
  }

  return true;
};

const notifyAdmins = async ({ prisma, title, message, type }) => {
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true, phone: true, name: true },
  });

  if (!admins.length) {
    return { notifiedCount: 0, whatsappCount: 0 };
  }

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title,
      message,
      type,
    })),
  });

  const recipients = collectRecipients(admins);
  let whatsappCount = 0;

  for (const to of recipients) {
    try {
      const sent = await sendWhatsAppMessage({ to, message: `${title}\n${message}` });
      if (sent) whatsappCount += 1;
    } catch (error) {
      console.error("Failed to send WhatsApp admin alert:", error.message || error);
    }
  }

  return { notifiedCount: admins.length, whatsappCount };
};

module.exports = {
  notifyAdmins,
};

const USERS_KEY = "hamarsrideUsers";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_error) {
    return [];
  }
};

const writeUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = async ({ name, phone, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Email is already in use.");
  }

  const profile = {
    name: String(name || "").trim(),
    phone: String(phone || "").trim(),
    email: normalizedEmail,
  };

  users.push({
    ...profile,
    password: String(password || ""),
  });
  writeUsers(users);

  return {
    token: `local-${Date.now()}`,
    refreshToken: `local-refresh-${Date.now()}`,
    profile,
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();
  const user = users.find((entry) => entry.email === normalizedEmail);

  if (!user) {
    throw new Error("No account found for this email.");
  }

  if (user.password !== String(password || "")) {
    throw new Error("Incorrect password.");
  }

  return {
    token: `local-${Date.now()}`,
    refreshToken: `local-refresh-${Date.now()}`,
    profile: {
      name: user.name,
      phone: user.phone,
      email: user.email,
    },
  };
};

export const sendPasswordReset = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const users = readUsers();
  const exists = users.some((user) => user.email === normalizedEmail);

  if (!exists) {
    throw new Error("No account found for this email.");
  }
};

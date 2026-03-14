const LOGIN_ERROR_MAP = {
  "auth/user-not-found": "Email does not exist.",
  "auth/wrong-password": "Wrong password. Please try again.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/user-disabled": "This account has been disabled.",
};

const SIGNUP_ERROR_MAP = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password is too weak. Please choose a stronger one.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/operation-not-allowed": "Email/password sign-up is currently disabled.",
};

export const getAuthErrorMessage = (error, context = "login") => {
  const code = error?.code || "";
  const map = context === "signup" ? SIGNUP_ERROR_MAP : LOGIN_ERROR_MAP;

  if (code && map[code]) {
    return map[code];
  }

  return "";
};

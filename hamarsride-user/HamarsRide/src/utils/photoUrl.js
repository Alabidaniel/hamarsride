import { API_BASE_URL } from "../config";

const getAssetOrigin = () => {
  if (API_BASE_URL.startsWith("http")) {
    return API_BASE_URL.replace(/\/api\/?$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
};

export const resolvePhotoUrl = (value) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;

  const origin = getAssetOrigin();
  return origin ? `${origin}${value}` : value;
};

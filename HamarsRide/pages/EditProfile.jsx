import React, { useEffect, useRef, useState } from "react";
import { Camera, Edit2 } from "lucide-react";
import Cropper from "react-easy-crop";
import NavbarMain from "../components/NavbarMain";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, apiFetch, getIdToken } from "../src/services/apiClient";
import { getCroppedImage } from "../src/utils/cropImage";

const EditProfile = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    altPhone: "",
    dateOfBirth: "",
    gender: "",
    email: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [error, setError] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const fileInputRef = useRef(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const payload = await apiFetch("/addresses");
        setAddresses(payload.addresses || []);
      } catch (err) {
        setError(err.message || "Failed to load addresses.");
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    loadAddresses();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const payload = await apiFetch("/me");
        setForm((prev) => ({
          ...prev,
          name: payload.user?.name || "",
          phone: payload.user?.phone || "",
          altPhone: payload.user?.altPhone || "",
          dateOfBirth: payload.user?.dateOfBirth
            ? new Date(payload.user.dateOfBirth).toISOString().slice(0, 10)
            : "",
          gender: payload.user?.gender || "",
          email: payload.user?.email || "",
        }));
        setPhotoUrl(payload.user?.photoUrl || "");
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    try {
      const payload = await apiFetch("/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          altPhone: form.altPhone,
          dateOfBirth: form.dateOfBirth ? form.dateOfBirth : undefined,
          gender: form.gender,
        }),
      });
      localStorage.setItem("userProfile", JSON.stringify(payload.user));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    }
  };

  const resolvePhotoUrl = (value) => {
    if (!value) return "";
    if (value.startsWith("http")) return value;
    return `${API_BASE_URL}${value}`;
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setSelectedPhoto({ file, previewUrl });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setShowCrop(true);
    event.target.value = "";
  };

  const uploadPhoto = async (file) => {
    setError("");
    setSuccess(false);
    setPhotoUploading(true);

    try {
      const token = await getIdToken(false);
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(`${API_BASE_URL}/me/photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        console.error("Photo upload failed:", {
          status: response.status,
          statusText: response.statusText,
          payload,
        });
        throw new Error(payload.error || "Failed to upload photo.");
      }

      const payload = await response.json();
      setPhotoUrl(payload.user?.photoUrl || "");
      localStorage.setItem("userProfile", JSON.stringify(payload.user));
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Photo upload error:", err);
      setError(err.message || "Failed to upload photo.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleCropComplete = (_croppedArea, croppedAreaPixelsValue) => {
    setCroppedAreaPixels(croppedAreaPixelsValue);
  };

  const handleCropSave = async () => {
    if (!selectedPhoto || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImage(
        selectedPhoto.previewUrl,
        croppedAreaPixels
      );
      const fileName = selectedPhoto.file?.name || "profile.jpg";
      const croppedFile = new File([croppedBlob], fileName, {
        type: croppedBlob?.type || "image/jpeg",
      });
      setShowCrop(false);
      URL.revokeObjectURL(selectedPhoto.previewUrl);
      setSelectedPhoto(null);
      await uploadPhoto(croppedFile);
    } catch (err) {
      console.error("Crop error:", err);
      setError(err.message || "Failed to crop photo.");
    }
  };

  const handleCropCancel = () => {
    if (selectedPhoto?.previewUrl) {
      URL.revokeObjectURL(selectedPhoto.previewUrl);
    }
    setSelectedPhoto(null);
    setShowCrop(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-[Poppins] text-gray-800">

      {/* ================= NAVBAR ================= */}
        <NavbarMain />

      {/* ================= PAGE HEADER ================= */}
      <div className="max-w-3xl mx-auto px-6 mt-10">
        <h1 className="text-3xl font-semibold">Edit Profile</h1>
        <p className="text-gray-500 mt-1">
          Update your personal information
        </p>
      </div>

      {/* ================= MAIN CARD ================= */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-md p-8 space-y-10">

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {isLoadingProfile ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              Loading profile...
            </div>
          ) : null}

          {/* ===== PROFILE PHOTO SECTION ===== */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-500 text-sm">
                {photoUrl ? (
                  <img
                    src={resolvePhotoUrl(photoUrl)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  "Photo"
                )}
              </div>

              <button
                type="button"
                onClick={handlePhotoClick}
                className="absolute bottom-2 right-2 bg-orange-600 p-2 rounded-full shadow-md cursor-pointer hover:bg-orange-700 transition disabled:opacity-60"
                disabled={photoUploading}
                aria-label="Upload profile photo"
              >
                <Camera size={16} className="text-white" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />

            <button
              type="button"
              onClick={handlePhotoClick}
              className="text-orange-600 text-sm font-medium hover:underline disabled:opacity-60"
              disabled={photoUploading}
            >
              {photoUploading ? "Uploading..." : "Change photo"}
            </button>
          </div>

          {/* ===== PERSONAL INFORMATION ===== */}
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                placeholder="Alabi Daniel"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                disabled
                value={form.email || ""}
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                type="text"
                placeholder="+234 800 000 0000"
                value={form.phone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, phone: event.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Alternate Phone (Optional)</label>
              <input
                type="text"
                placeholder="+234 900 000 0000"
                value={form.altPhone}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, altPhone: event.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth (Optional)</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender (Optional)</label>
                <select
                  value={form.gender || ""}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, gender: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* ===== ADDRESS SECTION ===== */}
            <div className="space-y-4 pt-6 border-t">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>

              <div className="space-y-4">
                {isLoadingAddresses ? (
                  <div className="text-sm text-gray-500">Loading addresses...</div>
                ) : addresses.length === 0 ? (
                  <div className="text-sm text-gray-500">No saved addresses yet.</div>
                ) : null}
                {addresses.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center bg-gray-50 rounded-xl p-4 border border-gray-200"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.details}</p>
                    </div>
                    <Edit2 size={18} className="text-gray-600 cursor-pointer hover:text-orange-600 transition" />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate("/add-address")}
                className="mt-2 text-orange-600 font-medium hover:underline"
              >
                Add New Address
              </button>
            </div>

            {/* ===== SECURITY SECTION ===== */}
            <div className="pt-6 border-t space-y-3">
              <h2 className="text-lg font-semibold">Security</h2>

              <button
                type="button"
                className="border border-gray-700 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-100 transition"
              >
                Change Password
              </button>

              <p className="text-sm text-orange-600 hover:underline cursor-pointer">
                Reset via email
              </p>
            </div>

            {/* ===== ACTION BUTTONS ===== */}
            <div className="pt-8 space-y-4">
              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition shadow-md"
                disabled={isLoadingProfile}
              >
                Save Changes
              </button>

              <button
                type="button"
                className="w-full border border-gray-700 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>

            {/* ===== SUCCESS MESSAGE ===== */}
            {success && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                Profile updated successfully
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <Footer />

      {showCrop ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Adjust your photo</h3>
            <div className="relative h-72 w-full bg-gray-900 rounded-xl overflow-hidden">
              <Cropper
                image={selectedPhoto?.previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className="mt-4">
              <label className="text-sm text-gray-600">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="w-full"
              />
            </div>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default EditProfile;

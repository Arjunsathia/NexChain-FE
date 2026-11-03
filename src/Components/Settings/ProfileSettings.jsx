import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import toast from "react-hot-toast";
import { Camera, Minus, Plus } from "lucide-react";
import api, { setMemoryToken } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import { UserAvatar } from "@/Components/ui/user-avatar";
import { getCroppedImgBlob } from "@/utils/canvasUtils";
import { Modal, ModalHeader } from "@/Components/ui/modal";
import SettingsSection, { Field } from "./SettingsSection";
import { inputClass, primaryButton, secondaryButton } from "./settingsStyles";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const fromUser = (u) => ({ name: u?.name || "", user_name: u?.user_name || "", email: u?.email || "", phone: u?.phone || "" });


/** Square crop of the chosen photo before upload */
function CropModal({ imageSrc, open, onClose, onSave, saving }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState(null);
  const onComplete = useCallback((_, area) => setPixels(area), []);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [open, imageSrc]);

  return (
    <Modal open={open} onClose={onClose} label="Crop profile photo">
      <ModalHeader title="Crop your photo" subtitle="Drag to position, and zoom to fit." onClose={onClose} />
      <div className="relative mx-5 h-72 overflow-hidden rounded-xl bg-black">
        {imageSrc && (
          <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete} />
        )}
      </div>
      <div className="flex items-center gap-3 px-5 pt-4">
        <Minus size={15} className="text-fg-subtle" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          aria-label="Zoom"
          className="flex-1 accent-[var(--brand)]"
        />
        <Plus size={15} className="text-fg-subtle" />
      </div>
      <div className="flex justify-end gap-2 p-5">
        <button type="button" onClick={onClose} className={secondaryButton}>
          Cancel
        </button>
        <button type="button" disabled={!pixels || saving} onClick={() => onSave(pixels)} className={primaryButton}>
          {saving ? "Uploading…" : "Save photo"}
        </button>
      </div>
    </Modal>
  );
}

/** Photo and personal details. Password and 2FA live under Security. */
export default function ProfileSettings() {
  const { user, updateUser } = useUserContext();
  const isGoogle = user?.provider === "google";
  const isDemo = !!user?.isDemo;
  const demoHint = "Locked on demo accounts.";
  const [form, setForm] = useState(() => fromUser(user));
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Load the saved values once the profile arrives (and after every save)
  useEffect(() => setForm(fromUser(user)), [user]);

  const saved = useMemo(() => fromUser(user), [user]);
  const dirty = Object.keys(form).some((k) => form[k] !== saved[k]);
  const emailChanged = form.email.trim().toLowerCase() !== saved.email.toLowerCase();

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const pickFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Choose an image under 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const uploadCropped = async (pixels) => {
    setUploading(true);
    try {
      const blob = await getCroppedImgBlob(imageSrc, pixels, 0, { horizontal: false, vertical: false }, "image/png");
      if (!blob) throw new Error("Couldn't prepare the image");
      const body = new FormData();
      body.append("image", new File([blob], "profile_image.png", { type: "image/png" }));
      const res = await api.put(`/users/profile-image/${user.id}`, body);
      if (res.data.user) updateUser(res.data.user);
      toast.success("Profile photo updated");
      setImageSrc(null);
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (emailChanged && !isGoogle && !isDemo && !currentPassword) {
      toast.error("Enter your current password to change your email");
      return;
    }
    setSaving(true);
    try {
      // Demo accounts may only rename themselves; the API rejects the other fields
      const body = isDemo
        ? { name: form.name.trim() }
        : { name: form.name.trim(), user_name: form.user_name.trim(), phone: form.phone.trim() };
      if (emailChanged && !isDemo) {
        body.email = form.email.trim();
        body.currentPassword = currentPassword;
      }
      const res = await api.put(`/users/${user.id}`, body);
      if (res.data.accessToken) setMemoryToken(res.data.accessToken);
      if (res.data.user) updateUser(res.data.user);
      setCurrentPassword("");
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Couldn't save your profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <SettingsSection title="Profile photo" description="Shown on the leaderboard and in your account menu.">
        <div className="flex items-center gap-5">
          <UserAvatar user={user} />
          <div className="space-y-2">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={isDemo} className={secondaryButton}>
              <Camera size={16} /> Upload new photo
            </button>
            <p className="text-xs text-fg-subtle">{isDemo ? "Photo uploads are off on demo accounts." : "JPG, PNG or WebP, up to 5 MB."}</p>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFile} className="hidden" />
        </div>
      </SettingsSection>

      <SettingsSection
        as="form"
        onSubmit={save}
        title="Personal details"
        description="Your name and username are visible to other traders; email and phone stay private."
        footerHint={dirty ? "You have unsaved changes." : "All changes saved."}
        footer={
          <>
            <button type="button" disabled={!dirty || saving} onClick={() => setForm(saved)} className={secondaryButton}>
              Discard
            </button>
            <button type="submit" disabled={!dirty || saving} className={primaryButton}>
              {saving ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="profile-name" label="Full name">
            <input id="profile-name" name="name" value={form.name} onChange={set} required minLength={2} maxLength={100} autoComplete="name" className={inputClass} />
          </Field>
          <Field id="profile-username" label="Username" hint={isDemo ? demoHint : "Letters and numbers, 3–30 characters."}>
            <input
              id="profile-username"
              name="user_name"
              value={form.user_name}
              onChange={set}
              disabled={isDemo}
              required
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9]+"
              autoComplete="username"
              className={inputClass}
            />
          </Field>
          <Field id="profile-email" label="Email" hint={isDemo ? demoHint : isGoogle ? "Managed by your Google account." : undefined}>
            <input id="profile-email" name="email" type="email" value={form.email} onChange={set} disabled={isGoogle || isDemo} required autoComplete="email" className={inputClass} />
          </Field>
          <Field id="profile-phone" label="Phone" hint={isDemo ? demoHint : "Optional."}>
            <input id="profile-phone" name="phone" type="tel" value={form.phone} onChange={set} disabled={isDemo} maxLength={30} autoComplete="tel" className={inputClass} />
          </Field>
          {emailChanged && !isGoogle && !isDemo && (
            <div className="sm:col-span-2">
              <Field id="profile-current-password" label="Current password" hint="Required to change your email, so nobody else can redirect your password resets.">
                <input
                  id="profile-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className={inputClass}
                />
              </Field>
            </div>
          )}
        </div>
      </SettingsSection>

      <CropModal imageSrc={imageSrc} open={!!imageSrc} onClose={() => setImageSrc(null)} onSave={uploadCropped} saving={uploading} />
    </div>
  );
}

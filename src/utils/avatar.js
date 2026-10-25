import { SERVER_URL } from "@/api/axiosConfig";

/**
 * Profile images are either full URLs (Cloudinary, Google) or filenames in the
 * API's public /uploads folder.
 */
export const getAvatarUrl = (image) => {
  if (!image) return null;
  return image.startsWith("http") ? image : `${SERVER_URL}/uploads/${image}`;
};

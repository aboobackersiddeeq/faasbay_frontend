// ============================================================================
// FaasBay Commerce OS — Cloudinary image upload helper
// ============================================================================
//
// Admin forms used to store photos as base64 data URIs directly on the
// product/banner document, which regularly blew past the API's JSON body
// limit. This uploads the image to Cloudinary instead and returns the
// resulting URL, so only a short string ever gets saved to MongoDB.

import { API_ENDPOINTS } from "@/config/api";
import { api } from "@/lib/api-client";

interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Uploads a base64 data URI (as produced by FileReader/canvas compression) to
 * Cloudinary and returns its hosted URL. Throws on failure — callers must not
 * fall back to saving the raw data URI, or a base64 blob ends up in MongoDB
 * again with no indication anything went wrong.
 */
export async function uploadImageToCloud(dataUrl: string, folder?: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:image/")) return dataUrl;

  const result = await api.post<UploadResult>(API_ENDPOINTS.upload, { image: dataUrl, folder }, { timeoutMs: 60000 });
  return result.url;
}

/** Uploads several images in parallel, preserving order. */
export async function uploadImagesToCloud(dataUrls: string[], folder?: string): Promise<string[]> {
  return Promise.all(dataUrls.map((url) => uploadImageToCloud(url, folder)));
}

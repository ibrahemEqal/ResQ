import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

const CLOUDINARY_SETTINGS_KEY = "resq.cloudinary.settings";
const DEFAULT_CLOUDINARY_CLOUD_NAME = "dxmmbzcoh";
const DEFAULT_CLOUDINARY_UPLOAD_PRESET = "resq_unsigned";

export type CloudinarySettings = {
  cloudName: string;
  uploadPreset: string;
};

type UploadImageParams = {
  uri: string;
  fileName: string;
  mimeType: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

export const emptyCloudinarySettings: CloudinarySettings = {
  cloudName: DEFAULT_CLOUDINARY_CLOUD_NAME,
  uploadPreset: DEFAULT_CLOUDINARY_UPLOAD_PRESET,
};

export const normalizeCloudinarySettings = (
  settings: CloudinarySettings,
): CloudinarySettings => ({
  cloudName: settings.cloudName.trim(),
  uploadPreset: settings.uploadPreset.trim(),
});

export const isCloudinaryConfigured = (settings: CloudinarySettings) => {
  const normalized = normalizeCloudinarySettings(settings);
  return Boolean(normalized.cloudName && normalized.uploadPreset);
};

export const getCloudinarySettings = async (): Promise<CloudinarySettings> => {
  const raw = await AsyncStorage.getItem(CLOUDINARY_SETTINGS_KEY);
  if (!raw) return emptyCloudinarySettings;

  try {
    const parsed = JSON.parse(raw) as Partial<CloudinarySettings>;
    return {
      cloudName: parsed.cloudName || DEFAULT_CLOUDINARY_CLOUD_NAME,
      uploadPreset: parsed.uploadPreset || DEFAULT_CLOUDINARY_UPLOAD_PRESET, 
    };
  } catch {
    return emptyCloudinarySettings;
  }
};

export const saveCloudinarySettings = async (settings: CloudinarySettings) => {
  await AsyncStorage.setItem(
    CLOUDINARY_SETTINGS_KEY,
    JSON.stringify(normalizeCloudinarySettings(settings)),
  );
};

export const uploadImageToCloudinary = async ({
  uri,
  fileName,
  mimeType,
}: UploadImageParams) => {
  const settings = normalizeCloudinarySettings(await getCloudinarySettings());

  if (!isCloudinaryConfigured(settings)) {
    throw new Error("يرجى إعداد Cloudinary من صفحة الإعدادات أولًا");
  }

  const formData = new FormData();

  if (uri.startsWith("data:")) {
    formData.append("file", uri);
  } else if (uri.startsWith("blob:")) {
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append("file", blob, fileName);
  } else {
    (formData as any).append("file", {
      uri,
      name: fileName,
      type: mimeType,
    });
  }

  formData.append("upload_preset", settings.uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(settings.cloudName)}/image/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });
  const data = (await response.json().catch(() => null)) as CloudinaryUploadResponse | null;

  if (!response.ok || !data?.secure_url) {
    throw new Error(
      data?.error?.message || `فشل رفع الصورة إلى Cloudinary (${response.status})`,
    );
  }

  return {
    secureUrl: data.secure_url,
    publicId: data.public_id ?? "",
    optimizedUrl: data.public_id
      ? buildCloudinaryImageUrl(data.public_id, {
        cloudName: settings.cloudName,
        width: 900,
        height: 900,
      })
      : data.secure_url,
  };
};

export const buildCloudinaryImageUrl = (
  publicId: string,
  options: { cloudName?: string; width?: number; height?: number } = {},
) => {
  const cloudName = options.cloudName ?? DEFAULT_CLOUDINARY_CLOUD_NAME;
  const width = options.width ?? 500;
  const height = options.height ?? 500;
  const cld = new Cloudinary({
    cloud: {
      cloudName,
    },
  });

  return cld
    .image(publicId)
    .format("auto")
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(width).height(height))
    .toURL();
};

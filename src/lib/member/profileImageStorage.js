const PROFILE_IMAGE_PREFIX =
  "tnal-member-profile-image-";

export function getProfileImageStorageKey(
  memberId,
) {
  if (
    memberId === undefined ||
    memberId === null ||
    memberId === ""
  ) {
    return "";
  }

  return `${PROFILE_IMAGE_PREFIX}${String(
    memberId,
  )}`;
}

export function getSavedProfileImage(
  memberId,
  fallbackImage = "/member.png",
) {
  if (
    typeof window === "undefined"
  ) {
    return fallbackImage;
  }

  const storageKey =
    getProfileImageStorageKey(
      memberId,
    );

  if (!storageKey) {
    return fallbackImage;
  }

  try {
    return (
      localStorage.getItem(
        storageKey,
      ) || fallbackImage
    );
  } catch (error) {
    console.error(
      "Cannot read profile image:",
      error,
    );

    return fallbackImage;
  }
}

export function saveProfileImage(
  memberId,
  imageData,
) {
  if (
    typeof window === "undefined"
  ) {
    return false;
  }

  const storageKey =
    getProfileImageStorageKey(
      memberId,
    );

  if (
    !storageKey ||
    !imageData
  ) {
    return false;
  }

  try {
    localStorage.setItem(
      storageKey,
      imageData,
    );

    window.dispatchEvent(
      new CustomEvent(
        "tnal-profile-image-change",
        {
          detail: {
            memberId: String(
              memberId,
            ),
            imageData,
          },
        },
      ),
    );

    return true;
  } catch (error) {
    console.error(
      "Cannot save profile image:",
      error,
    );

    return false;
  }
}

export function removeSavedProfileImage(
  memberId,
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const storageKey =
    getProfileImageStorageKey(
      memberId,
    );

  if (!storageKey) {
    return;
  }

  localStorage.removeItem(
    storageKey,
  );

  window.dispatchEvent(
    new CustomEvent(
      "tnal-profile-image-change",
      {
        detail: {
          memberId: String(
            memberId,
          ),
          imageData: "",
        },
      },
    ),
  );
}
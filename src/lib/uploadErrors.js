// A 413 (Payload Too Large) can arrive as either the app's own JSON error
// or a bare error page from whatever sits in front of it (nginx, the
// platform hosting this Next.js app) -- in the second case there's no
// JSON body to read a message from at all. Either way it always means
// the same thing to the user, so every upload flow should show the same
// clear "file is too large" message instead of falling through to a
// generic "can't reach the server" one that gives no indication why.
export function isFileTooLarge(response) {
  return response?.status === 413;
}

// Call from an upload's catch/error-handling block: pass the fetch
// Response, and a translate function (t from useLanguage). Returns the
// message to show, preferring the specific "too large" copy for a 413
// over whatever fallback the caller had in mind.
export function describeUploadError(response, t, fallbackMessage) {
  if (isFileTooLarge(response)) {
    return t("common.fileTooLarge");
  }

  return fallbackMessage;
}

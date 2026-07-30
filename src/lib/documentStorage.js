const DB_NAME = "tnal-youth-documents-db";
const DB_VERSION = 1;
const STORE_NAME = "templates";

export function createDocumentId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION,
    );

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      if (
        !database.objectStoreNames.contains(
          STORE_NAME,
        )
      ) {
        database.createObjectStore(
          STORE_NAME,
          {
            keyPath: "id",
          },
        );
      }
    };
  });
}

export async function saveTemplateFile({
  id,
  file,
}) {
  if (!id || !file) {
    throw new Error(
      "Template ID and file are required.",
    );
  }

  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        STORE_NAME,
        "readwrite",
      );

    const store =
      transaction.objectStore(
        STORE_NAME,
      );

    store.put({
      id,
      file,
      fileName: file.name,
      fileType: file.type,
      createdAt:
        new Date().toISOString(),
    });

    transaction.oncomplete = () => {
      database.close();
      resolve(id);
    };

    transaction.onerror = () => {
      const error =
        transaction.error;

      database.close();
      reject(error);
    };
  });
}

export async function getTemplateFile(
  id,
) {
  if (!id) return null;

  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        STORE_NAME,
        "readonly",
      );

    const store =
      transaction.objectStore(
        STORE_NAME,
      );

    const request = store.get(id);

    request.onsuccess = () => {
      database.close();

      resolve(
        request.result?.file || null,
      );
    };

    request.onerror = () => {
      const error = request.error;

      database.close();
      reject(error);
    };
  });
}

export async function getTemplateUrl(
  id,
) {
  const file =
    await getTemplateFile(id);

  if (!file) return "";

  return URL.createObjectURL(file);
}

export async function deleteTemplateFile(
  id,
) {
  if (!id) return;

  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction =
      database.transaction(
        STORE_NAME,
        "readwrite",
      );

    transaction
      .objectStore(STORE_NAME)
      .delete(id);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      const error =
        transaction.error;

      database.close();
      reject(error);
    };
  });
}
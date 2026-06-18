type UploadResult = {
  url?: string;
  doc_type?: "pdf" | "docx";
  error?: string;
};

export function uploadFileWithProgress(
  endpoint: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.set("file", file);

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      try {
        const data = JSON.parse(xhr.responseText) as UploadResult;

        if (xhr.status >= 200 && xhr.status < 300 && data.url) {
          resolve({ url: data.url, doc_type: data.doc_type });
          return;
        }

        resolve({ error: data.error ?? "Upload failed. Try again." });
      } catch {
        resolve({ error: "Upload failed. Try again." });
      }
    });

    xhr.addEventListener("error", () => {
      resolve({ error: "Upload failed. Check your connection and try again." });
    });

    xhr.open("POST", endpoint);
    xhr.send(formData);
  });
}

export function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Couldn't read that video file."));
    };

    video.src = objectUrl;
  });
}

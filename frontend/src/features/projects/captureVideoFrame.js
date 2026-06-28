// Capture a still frame from a video File and return it as an image File.
// Used to derive a project cover when the admin uploads a demo video but no
// cover image. Only safe on a local File (object URL) — a remote video URL
// taints the canvas and toBlob() throws a SecurityError.
export function captureVideoFrame(file, { seekTo = 1, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => {
      // Seek a little in to skip a black intro frame, clamped to the clip.
      const half = (video.duration || seekTo) / 2;
      const target = Math.min(seekTo, half);
      video.currentTime = Number.isFinite(target) && target > 0 ? target : 0;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        if (!canvas.width || !canvas.height) {
          cleanup();
          reject(new Error('Video has no dimensions to capture.'));
          return;
        }
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (!blob) {
              reject(new Error('Frame capture produced no image.'));
              return;
            }
            resolve(new File([blob], 'cover-from-video.jpg', { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Could not load video for frame capture.'));
    };

    video.src = url;
  });
}

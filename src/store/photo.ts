// A photo of a page is resized before it is stored: about 2000 px on the long side is enough to
// judge a drawing and keeps a year of practice to a few hundred megabytes. The original is not
// kept. Orientation from the camera is applied by createImageBitmap.

export interface PreparedPhoto {
  photo: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

async function scaled(bitmap: ImageBitmap, longSide: number, quality: number): Promise<{ blob: Blob; width: number; height: number }> {
  const scale = Math.min(1, longSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot resize images.');
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('The photo could not be saved.');
  return { blob, width, height };
}

export async function preparePhoto(file: Blob): Promise<PreparedPhoto> {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    const photo = await scaled(bitmap, 2000, 0.86);
    const thumb = await scaled(bitmap, 480, 0.8);
    return { photo: photo.blob, thumb: thumb.blob, width: photo.width, height: photo.height };
  } finally {
    bitmap.close();
  }
}

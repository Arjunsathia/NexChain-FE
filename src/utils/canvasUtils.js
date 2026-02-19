const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    // Only set crossOrigin if not a data URL to avoid tainting issues
    if (!url.startsWith('data:')) {
      image.setAttribute('crossOrigin', 'anonymous')
    }
    image.src = url
  })

function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

export const getCroppedImgBlob = async (imageSrc, pixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }, mimeType = 'image/png') => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // Safe integer parsing helper
  const safeInt = (val) => {
    const num = Math.round(val);
    return !Number.isFinite(num) ? 0 : num;
  };

  // Set canvas size to the bounding box size
  const safeBBoxWidth = Math.max(1, safeInt(bBoxWidth));
  const safeBBoxHeight = Math.max(1, safeInt(bBoxHeight));

  canvas.width = safeBBoxWidth;
  canvas.height = safeBBoxHeight;

  // Center the image in the canvas
  ctx.translate(safeBBoxWidth / 2, safeBBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  ctx.drawImage(image, 0, 0);

  // Validate crop data
  let cropX = safeInt(pixelCrop.x);
  let cropY = safeInt(pixelCrop.y);
  let cropWidth = safeInt(pixelCrop.width);
  let cropHeight = safeInt(pixelCrop.height);

  // Fallback if crop dimensions are invalid (0 or infinite)
  // This prevents returning a 1x1 pixel image if the cropper hasn't initialized correctly
  if (cropWidth <= 0 || cropHeight <= 0) {
    cropX = 0;
    cropY = 0;
    cropWidth = safeBBoxWidth;
    cropHeight = safeBBoxHeight;
  }

  // Extract the cropped image data
  const data = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);

  // Resize canvas to the cropped size
  canvas.width = cropWidth;
  canvas.height = cropHeight;

  // Put the cropped image data back onto the resized canvas
  ctx.putImageData(data, 0, 0)

  // Return as Blob
  return new Promise((resolve) => {
    canvas.toBlob((file) => {
      resolve(file)
    }, mimeType)
  })
}

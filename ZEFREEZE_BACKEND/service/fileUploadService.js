// backendZ/services/fileUploadService.js
async function uploadToS3(file) {
  // Implémentation réelle ou simulation
  console.log(`Upload vers S3 pour ${file.originalname}`);
  return `https://your-bucket.s3.amazonaws.com/${Date.now()}-${file.originalname}`;
}

module.exports = { uploadToS3 };

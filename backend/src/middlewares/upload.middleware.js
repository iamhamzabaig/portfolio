import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, crop: 'limit' }],
  },
});

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new ApiError(400, 'Only image uploads are allowed'));
};

export const uploadCover = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('coverImage');

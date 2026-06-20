import { ContactMessage } from '../models/contactMessage.model.js';
import { ApiError } from '../utils/ApiError.js';

export const createMessage = async (data) => ContactMessage.create(data);

export const listMessages = async () => ContactMessage.find().sort({ createdAt: -1 });

export const deleteMessage = async (id) => {
  const msg = await ContactMessage.findByIdAndDelete(id);
  if (!msg) throw new ApiError(404, 'Message not found');
};

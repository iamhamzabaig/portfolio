import { createMessage, listMessages, deleteMessage } from '../services/contact.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const contactController = {
  create: asyncHandler(async (req, res) => {
    const data = await createMessage(req.body);
    res.status(201).json(new ApiResponse(201, data, 'Message sent'));
  }),

  list: asyncHandler(async (_req, res) => {
    const data = await listMessages();
    res.status(200).json(new ApiResponse(200, data));
  }),

  remove: asyncHandler(async (req, res) => {
    await deleteMessage(req.params.id);
    res.status(200).json(new ApiResponse(200, null, 'Message deleted'));
  }),
};

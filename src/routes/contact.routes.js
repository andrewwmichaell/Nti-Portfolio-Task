const express = require('express');
const ContactMessage = require('../models/contact-message.model');
const { createContactMessageSchema } = require('../validators/contact.validator');

const router = express.Router();

router.get('/', async (_req, res) => {
  const messages = await ContactMessage.find({ isDeleted: false }).sort({ createdAt: -1 });
  res.json(messages);
});

router.post('/', async (req, res) => {
  const parsed = createContactMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.issues });
  }

  const message = await ContactMessage.create(parsed.data);
  res.json(message);
});

router.patch('/clear-all', async (_req, res) => {
  await ContactMessage.updateMany({ isDeleted: false }, { $set: { isDeleted: true } });
  res.json({ success: true });
});

router.patch('/:id', async (req, res) => {
  const updates = {};
  if (req.body.isRead !== undefined) updates.isRead = !!req.body.isRead;
  if (req.body.isDeleted !== undefined) updates.isDeleted = !!req.body.isDeleted;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'No updates provided.' });
  }

  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
  if (!message) {
    return res.status(404).json({ message: 'Message not found.' });
  }

  res.json(message);
});

module.exports = router;

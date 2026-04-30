const { z } = require('zod');

const createContactMessageSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  subject: z.string().trim().optional(),
  message: z.string().trim().min(1),
});

module.exports = { createContactMessageSchema };

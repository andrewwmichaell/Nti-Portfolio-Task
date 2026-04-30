const { z } = require('zod');

const urlOrEmpty = z.string().trim().url().or(z.literal(''));

const createProjectSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  imageUrls: z.array(z.string().trim()).optional(),
  techTags: z.array(z.string().trim()).optional(),
  githubUrl: urlOrEmpty.optional(),
  demoUrl: urlOrEmpty.optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = { createProjectSchema, updateProjectSchema };

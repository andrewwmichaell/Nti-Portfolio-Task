const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Project = require('../models/project.model');
const {
  createProjectSchema,
  updateProjectSchema,
} = require('../validators/project.validator');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 5 * 1024 * 1024 },
});

router.get('/', async (_req, res) => {
  const projects = await Project.find({ isDeleted: false }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
  res.json(projects);
});

router.post('/', upload.array('images', 10), async (req, res) => {
  const rawTechTags = req.body.techTags || '';
  const imageDataUrls = (req.files || []).map((file) => {
    const mimeType = file.mimetype || 'image/jpeg';
    const base64 = file.buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  });

  const normalized = {
    title: req.body.title,
    description: req.body.description,
    techTags: rawTechTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    githubUrl: req.body.githubUrl || '',
    demoUrl: req.body.demoUrl || '',
    isFeatured: req.body.isFeatured === 'true',
    sortOrder: req.body.sortOrder ? Number(req.body.sortOrder) : 0,
    imageUrls: imageDataUrls,
  };

  const parsed = createProjectSchema.safeParse(normalized);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.issues });
  }

  const created = await Project.create(parsed.data);
  return res.status(201).json(created);
});

router.patch('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid project id' });
  }

  const parsed = updateProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.issues });
  }

  const updated = await Project.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    parsed.data,
    { new: true }
  );

  if (!updated) {
    return res.status(404).json({ message: 'Project not found' });
  }

  return res.json(updated);
});

router.delete('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid project id' });
  }

  const deleted = await Project.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!deleted) {
    return res.status(404).json({ message: 'Project not found' });
  }

  return res.json({ message: 'Project soft deleted' });
});

router.patch('/:id/restore', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid project id' });
  }

  const restored = await Project.findOneAndUpdate(
    { _id: req.params.id, isDeleted: true },
    { isDeleted: false, deletedAt: null },
    { new: true }
  );

  if (!restored) {
    return res.status(404).json({ message: 'Project not found or not deleted' });
  }

  return res.json(restored);
});

module.exports = router;

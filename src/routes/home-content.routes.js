const express = require('express');
const multer = require('multer');
const HomeContent = require('../models/home-content.model');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 5 * 1024 * 1024, fieldSize: 10 * 1024 * 1024 },
});

router.get('/', async (_req, res) => {
  let content = await HomeContent.findOne({ key: 'home' });
  if (!content) {
    content = await HomeContent.create({ key: 'home' });
  }
  res.json(content);
});

router.put('/', upload.single('profileImage'), async (req, res) => {
  const uploadedImageUrl = req.file
    ? `data:${req.file.mimetype || 'image/jpeg'};base64,${req.file.buffer.toString('base64')}`
    : undefined;

  const updates = {
    fullName: req.body.fullName,
    aboutTitle: req.body.aboutTitle,
    bio: req.body.bio,
    profileImageUrl: uploadedImageUrl || req.body.profileImageUrl,
    featuredTitle: req.body.featuredTitle,
    featuredDescription: req.body.featuredDescription,
  };

  Object.keys(updates).forEach((key) => {
    if (updates[key] === undefined) {
      delete updates[key];
    }
  });

  const content = await HomeContent.findOneAndUpdate(
    { key: 'home' },
    { $set: updates, $setOnInsert: { key: 'home' } },
    { new: true, upsert: true }
  );

  res.json(content);
});

module.exports = router;

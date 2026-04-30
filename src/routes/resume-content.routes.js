const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ResumeContent = require('../models/resume-content.model');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 10 * 1024 * 1024 }, // 10MB limit for PDFs
});

router.get('/', async (_req, res) => {
  let content = await ResumeContent.findOne({ key: 'resume' });
  if (!content) {
    content = await ResumeContent.create({
      key: 'resume',
      pdfUrl: '',
      workExperience: [],
      education: [],
      certifications: [],
      skills: [],
      sections: [],
    });
  }
  res.json(content);
});

router.put('/', upload.single('resumePdf'), async (req, res) => {
  let pdfUrl = req.body.pdfUrl;

  // Handle file upload
  if (req.file) {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `resume-${Date.now()}-${Math.random().toString(36).substring(2)}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, req.file.buffer);
    pdfUrl = `/uploads/${fileName}`;
  }

  const updates = {
    pdfUrl,
    workExperience: req.body.workExperience,
    education: req.body.education,
    certifications: req.body.certifications,
    skills: req.body.skills,
  };

  Object.keys(updates).forEach((key) => {
    if (updates[key] === undefined) {
      delete updates[key];
    }
  });

  const content = await ResumeContent.findOneAndUpdate(
    { key: 'resume' },
    { $set: updates, $setOnInsert: { key: 'resume' } },
    { returnDocument: 'after', upsert: true }
  );

  res.json(content);
});

module.exports = router;

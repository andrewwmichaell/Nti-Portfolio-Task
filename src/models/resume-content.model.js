const mongoose = require('mongoose');

const resumeEntrySchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    bullets: { type: [String], default: [] },
  },
  { _id: false }
);

const resumeSkillColumnSchema = new mongoose.Schema(
  {
    heading: { type: String, default: '' },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

const resumeSectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    entries: { type: [resumeEntrySchema], default: [] },
    columns: { type: [resumeSkillColumnSchema], default: [] },
  },
  { _id: false }
);

const resumeContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'resume' },
    pdfUrl: { type: String, default: '' },
    workExperience: { type: [resumeEntrySchema], default: [] },
    education: { type: [resumeEntrySchema], default: [] },
    certifications: { type: [resumeEntrySchema], default: [] },
    skills: { type: [resumeSkillColumnSchema], default: [] },
    sections: { type: [resumeSectionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeContent', resumeContentSchema);

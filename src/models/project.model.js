const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrls: { type: [String], default: [] },
    techTags: { type: [String], default: [] },
    githubUrl: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);

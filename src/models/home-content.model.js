const mongoose = require('mongoose');

const homeContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'home' },
    fullName: { type: String, required: true, default: '' },
    aboutTitle: { type: String, required: true, default: '' },
    bio: { type: String, required: true, default: '' },
    profileImageUrl: { type: String, required: true, default: '' },
    featuredTitle: { type: String, required: true, default: '' },
    featuredDescription: { type: String, required: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeContent', homeContentSchema);

const mongoose = require('mongoose');
const mongooseHidden = require('mongoose-hidden')();

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '',
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
});

categorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

categorySchema.set('toJSON', {
  virtuals: true,
});

categorySchema.plugin(mongooseHidden);

exports.Category = mongoose.model('Category', categorySchema);

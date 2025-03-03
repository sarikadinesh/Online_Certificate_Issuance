const mongoose = require('mongoose');

const CertificateRequestSchema = new mongoose.Schema({
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicantName: { type: String, required: true },  
  applicantEmail: { type: String, required: true }, 
  certificateType: { type: String, required: true },
  documentPath: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  remarks: { type: String, default: '' },
  issuedDate: { type: Date, default: null }
}, { timestamps: true }); 

module.exports = mongoose.model('CertificateRequest', CertificateRequestSchema);

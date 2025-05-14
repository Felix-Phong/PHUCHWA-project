const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); 

const cardSchema = new mongoose.Schema({
  card_id: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
    description: 'ID duy nhất của thẻ (có thể là QR code hoặc mã NFC).'
  },
  hashed_student_id: {
    type: String,
    description: 'Băm ID sinh viên của nurse, liên kết với collection nurses.'
  },
  user_id: {
    type: String,
    description: 'ID người dùng elderly, liên kết với collection elderlies.'
  },
  role: {
    type: String,
    enum: ['nurse', 'elderly'],
    required: true
  },
  public_key: {
    type: String,
    required: true,
    description: 'Khóa công khai để xác thực chữ ký số.'
  },
  private_key_encrypted: {
    type: String,
    required: true,
    description: 'Khóa riêng tư được mã hóa để bảo mật.'
  },
  qr_code_data: {
    type: String,
    required: true,
    description: 'Dữ liệu QR code chứa thông tin liên quan đến thẻ.'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Card = mongoose.model('Card', cardSchema);
module.exports = Card;
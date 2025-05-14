const Card = require('../models/CardModel');
const ApiError = require('../utils/apiError');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const elliptic = require('elliptic');
const EC = new elliptic.ec('secp256k1');

// Hàm hash student_id (SHA256)
function hashStudentId(student_id) {
  return crypto.createHash('sha256').update(student_id).digest('hex');
}

// Sinh ECC keypair
function generateECCKeyPair() {
  const key = EC.genKeyPair();
  const publicKey = key.getPublic('hex');
  const privateKey = key.getPrivate('hex');
  return { publicKey, privateKey };
}

// Mã hóa private key (ví dụ base64, thực tế nên dùng giải pháp bảo mật hơn)
function encryptPrivateKey(privateKey) {
  return Buffer.from(privateKey).toString('base64');
}

const createCardService = async ({ user_id, student_id, role }) => {
  try {
    const card_id = uuidv4();

    // Sinh ECC keypair
    const { publicKey, privateKey } = generateECCKeyPair();
    const private_key_encrypted = encryptPrivateKey(privateKey);

    // Hash student_id nếu là nurse
    let hashed_student_id = undefined;
    if (role === 'nurse' && student_id) {
      hashed_student_id = hashStudentId(student_id);
    }

    // Tạo dữ liệu QR code
    const qr_code_data = JSON.stringify({
      card_id,
      user_id,
      public_key: publicKey
    });

    // Tạo card
    const card = await Card.create({
      card_id,
      hashed_student_id,
      user_id,
      role,
      public_key: publicKey,
      private_key_encrypted,
      qr_code_data
    });

    return card;
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'Card ID already exists');
    }
    throw new ApiError(500, 'Internal server error');
  }
};

const getCardByCardIdService = async (card_id) => {
  const card = await Card.findOne({ card_id });
  if (!card) throw new ApiError(404, 'Card not found');
  return card;
};

const getCardByUserIdService = async (user_id) => {
  const card = await Card.findOne({ user_id });
  if (!card) throw new ApiError(404, 'Card not found');
  return card;
};

const updateCardService = async (card_id, updateData) => {
  const card = await Card.findOneAndUpdate({ card_id }, updateData, { new: true });
  if (!card) throw new ApiError(404, 'Card not found');
  return card;
};

const deleteCardService = async (card_id) => {
  const card = await Card.findOneAndDelete({ card_id });
  if (!card) throw new ApiError(404, 'Card not found');
  return { message: 'Card deleted' };
};
module.exports = {
  createCardService,
  getCardByCardIdService,
  getCardByUserIdService,
  updateCardService,
  deleteCardService
};
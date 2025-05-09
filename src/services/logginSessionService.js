const LoggingSession = require('../models/LogginSessionModel');

// Tạo phiên đăng nhập mới
const createLoggingSession = async ({user_id,role,token,card_id}) => {
try {
  const session = new LoggingSession({
    user_id,
    role,
    token,
    card_id
  });
  await session.save();
  console.log('Logging session created:', session);
  return session;
} catch (error) {
  console.error('Error creating logging session:', error);
  throw new Error('Failed to create logging session');
}
};


// Cập nhật thời gian đăng xuất
const updateLogoutTime = async (token) => {
  try {
    const session = await LoggingSession.findOneAndUpdate(
      { token },
      { logout_time: new Date() },
      { new: true }
    );
    if (!session) {
      throw new Error('Session not found');
    }
    console.log('Logout time updated:', session);
    return session;
} catch (error) {
    console.error('Error updating logout time:', error);
    throw new Error('Failed to update logout time');
  }
};

module.exports = {
  createLoggingSession,
  updateLogoutTime
};
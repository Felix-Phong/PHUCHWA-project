const {
  createCardService,
  getCardByCardIdService,
  getCardByUserIdService,
  updateCardService,
  deleteCardService
} = require('../services/cardService');

const createCard = async (req, res) => {
  try {
    const card = await createCardService(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        card,
      },
    });
  } catch (error) {
    next(error);
  }
}

const getCardByCardId = async (req, res, next) => {
  try {
    const card = await getCardByCardIdService(req.params.card_id);
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
};

const getCardByUserId = async (req, res, next) => {
  try {
    const card = await getCardByUserIdService(req.params.user_id);
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
};

const updateCard = async (req, res, next) => {
  try {
    const card = await updateCardService(req.params.card_id, req.body);
    res.status(200).json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const result = await deleteCardService(req.params.card_id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCard,
  getCardByCardId,
  getCardByUserId,
  updateCard,
  deleteCard
};
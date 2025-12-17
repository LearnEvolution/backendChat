import Message from "../models/Message.js";

export const saveMessage = async (data) => {
  try {
    await Message.create({
      name: data.name,
      message: data.message,
    });
  } catch (err) {
    console.log("Erro ao salvar mensagem:", err.message);
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Erro ao carregar mensagens" });
  }
};

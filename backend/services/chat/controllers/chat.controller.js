import Conversation from "../model/conversation.model.js";
import Message from "../model/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const sender = req.userId;
    const receiver = req.params.id;
    const { message } = req.body;

    // Create new message
    const newMessage = await Message.create({
      sender,
      receiver,
      message,
    });

    // Check existing conversation
    let CheckConversation = await Conversation.findOne({
      senderId: sender,
      receiverId: receiver,
    });

    // Create new conversation
    if (!CheckConversation) {
      CheckConversation = await Conversation.create({
        senderId: sender,
        receiverId: receiver,
        messages: [newMessage._id],
      });

      return res.status(201).json(newMessage);
    }

    // Push message into existing conversation
    CheckConversation.messages.push(newMessage._id);
    await CheckConversation.save();

    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("This is error from message controller:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const GetMessages = async (req, res) => {
  try {
    const sender = req.userId;
    const receiver = req.params.id;

    const CheckConversation = await Conversation.findOne({
      senderId: sender,
      receiverId: receiver,
    }).populate("messages");

    if (!CheckConversation) {
      return res.status(200).json([]);
    }

    return res.status(200).json(CheckConversation.messages);
  } catch (error) {
    console.log("This is get message error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

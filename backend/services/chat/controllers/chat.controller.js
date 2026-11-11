
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
      text: message,
    });

    // Find conversation in both directions
    let CheckConversation = await Conversation.findOne({
      $or: [
        { senderId: sender, receiverId: receiver },
        { senderId: receiver, receiverId: sender },
      ],
    });

    // Create conversation if it does not exist
    if (!CheckConversation) {
      CheckConversation = await Conversation.create({
        senderId: sender,
        receiverId: receiver,
        messages: [newMessage._id],
      });
    } else {
      // Add message to existing conversation
      CheckConversation.messages.push(newMessage._id);
      await CheckConversation.save();
    }

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

    // Find conversation in both directions
    const CheckConversation = await Conversation.findOne({
      $or: [
        { senderId: sender, receiverId: receiver },
        { senderId: receiver, receiverId: sender },
      ],
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

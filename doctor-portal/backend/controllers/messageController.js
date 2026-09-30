import db, { getDB, saveDB } from "../config/db.js";

// Get all 1-to-1 conversations for the authenticated doctor
export const getConversations = (req, res) => {
  try {
    const currentDoctorId = req.doctor.doctorId;
    const allDoctors = db.find("doctors", (d) => d.doctorId !== currentDoctorId && d.isActive);

    const conversations = allDoctors.map((doc) => {
      // Deterministic conversation ID: sorted doctor IDs
      const conversationId = [currentDoctorId, doc.doctorId].sort().join("_");
      
      const messagesBetween = db.find(
        "messages",
        (m) => m.conversationId === conversationId
      ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      const lastMessage = messagesBetween.length > 0 ? messagesBetween[messagesBetween.length - 1] : null;
      const unreadCount = messagesBetween.filter(
        (m) => (m.recipientDoctorId === currentDoctorId || m.receiverId === currentDoctorId) && !m.isRead
      ).length;

      return {
        conversationId,
        doctor: {
          id: doc.id,
          doctorId: doc.doctorId,
          name: doc.name,
          specialization: doc.specialization,
          department: doc.department,
          avatar: doc.avatar,
          publicKey: doc.publicKey || null
        },
        lastMessage,
        unreadCount
      };
    });

    // Sort by most recent message timestamp
    conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp);
    });

    return res.status(200).json({
      success: true,
      conversations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for an isolated conversation with participant authorization check
export const getConversationMessages = (req, res) => {
  try {
    const currentDoctorId = req.doctor.doctorId;
    const rawParam = req.params.conversationId || req.params.doctorId;

    let conversationId;
    let otherDoctorId;

    if (rawParam.includes("_")) {
      conversationId = rawParam;
      const parts = conversationId.split("_");
      if (parts.length !== 2) {
        return res.status(400).json({ success: false, message: "Invalid conversation ID format." });
      }

      // CRITICAL SECURITY: Verify authenticated doctor is an authorized participant
      if (!parts.includes(currentDoctorId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not an authorized participant in this private conversation."
        });
      }
      otherDoctorId = parts.find((p) => p !== currentDoctorId);
    } else {
      // Provided a doctorId directly
      otherDoctorId = rawParam;
      conversationId = [currentDoctorId, otherDoctorId].sort().join("_");
    }

    const otherDoctor = db.findOne("doctors", (d) => d.doctorId === otherDoctorId);
    if (!otherDoctor) {
      return res.status(404).json({ success: false, message: "Target doctor not found." });
    }

    // Mark ONLY messages in this exact conversation as read where recipient is current doctor
    const allMessages = db.getDB().messages || [];
    let updatedAny = false;
    allMessages.forEach((m) => {
      if (
        m.conversationId === conversationId &&
        (m.recipientDoctorId === currentDoctorId || m.receiverId === currentDoctorId) &&
        !m.isRead
      ) {
        m.isRead = true;
        updatedAny = true;
      }
    });
    if (updatedAny) {
      db.saveDB();
    }

    // Query messages strictly isolated to this exact conversationId
    const messages = db
      .find("messages", (m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    const { password, ...safeOtherDoctor } = otherDoctor;

    return res.status(200).json({
      success: true,
      conversationId,
      otherDoctor: safeOtherDoctor,
      messages
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send an End-to-End Encrypted message
export const sendMessage = (req, res) => {
  try {
    const sender = req.doctor;
    const { conversationId, recipientDoctorId, receiverId, ciphertext, nonce, algorithm } = req.body;

    const targetRecipientId = recipientDoctorId || receiverId;

    if (!targetRecipientId) {
      return res.status(400).json({
        success: false,
        message: "Recipient Doctor ID is required."
      });
    }

    if (targetRecipientId === sender.doctorId) {
      return res.status(400).json({
        success: false,
        message: "Private chat requires two distinct doctors. You cannot message yourself."
      });
    }

    const expectedConversationId = [sender.doctorId, targetRecipientId].sort().join("_");

    // Verify conversation ID participant match
    if (conversationId && conversationId !== expectedConversationId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Conversation participants do not match the conversation ID."
      });
    }

    // Real E2EE constraint: Server requires ciphertext and cryptographic nonce. Plaintext is rejected!
    if (!ciphertext || !nonce) {
      return res.status(400).json({
        success: false,
        message: "End-to-End Encryption required. Both ciphertext and cryptographic nonce must be provided. Plaintext messages are rejected."
      });
    }

    const receiverDoctor = db.findOne("doctors", (d) => d.doctorId === targetRecipientId);
    if (!receiverDoctor) {
      return res.status(404).json({
        success: false,
        message: "Target recipient doctor does not exist."
      });
    }

    const finalConversationId = expectedConversationId;

    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      conversationId: finalConversationId,
      senderDoctorId: sender.doctorId,
      senderId: sender.doctorId,
      senderName: sender.name,
      recipientDoctorId: receiverDoctor.doctorId,
      receiverId: receiverDoctor.doctorId,
      receiverName: receiverDoctor.name,
      ciphertext,
      nonce,
      algorithm: algorithm || "X25519-XSalsa20-Poly1305",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isRead: false
    };

    db.insert("messages", newMessage);

    // Notify the receiver (Never include plaintext in notification)
    db.insert("notifications", {
      id: `notif-${Date.now()}`,
      doctorId: receiverDoctor.doctorId,
      title: `Encrypted message from ${sender.name}`,
      message: "You have received a new end-to-end encrypted clinical message.",
      type: "message",
      isRead: false,
      timestamp: new Date().toISOString(),
      link: "/doctor/messages"
    });

    return res.status(201).json({
      success: true,
      message: "End-to-End encrypted message delivered securely.",
      data: newMessage
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve public key of a doctor
export const getDoctorPublicKey = (req, res) => {
  try {
    const { doctorId } = req.params;
    const targetDoctor = db.findOne("doctors", (d) => d.doctorId === doctorId);
    if (!targetDoctor) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }
    return res.status(200).json({
      success: true,
      doctorId: targetDoctor.doctorId,
      publicKey: targetDoctor.publicKey || null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Register or update public key of authenticated doctor
export const setDoctorPublicKey = (req, res) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) {
      return res.status(400).json({ success: false, message: "Public key is required." });
    }

    db.update("doctors", (d) => d.doctorId === req.doctor.doctorId, {
      publicKey
    });

    return res.status(200).json({
      success: true,
      message: "Public key registered successfully."
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

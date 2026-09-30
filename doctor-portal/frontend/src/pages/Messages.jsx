import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  CheckCheck,
  Lock,
  Loader2,
  AlertCircle
} from "lucide-react";
import { messageApi } from "../api/client.js";
import {
  initCrypto,
  getDoctorPublicKeyBase64,
  getDeterministicConversationId,
  encryptMessage,
  decryptMessage
} from "../crypto/cryptoService.js";

export const Messages = () => {
  const { doctor } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeDoctor, setActiveDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputContent, setInputContent] = useState("");
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [sending, setSending] = useState(false);
  const [peerPublicKey, setPeerPublicKey] = useState(null);
  const [lastMessagePreviews, setLastMessagePreviews] = useState({});

  const chatBottomRef = useRef(null);
  const abortControllerRef = useRef(null);
  const activeConversationIdRef = useRef("");

  // Initialize E2EE crypto and register own public key on mount
  useEffect(() => {
    let isMounted = true;

    async function setupCryptoAndConversations() {
      try {
        await initCrypto();
        if (doctor?.doctorId) {
          const myPubKey = await getDoctorPublicKeyBase64(doctor.doctorId);
          await messageApi.setPublicKey(myPubKey).catch((err) => {
            console.warn("Could not register public key with server:", err);
          });
        }
        if (isMounted) {
          await loadConversations();
        }
      } catch (err) {
        console.error("Crypto init error:", err);
      }
    }

    setupCryptoAndConversations();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [doctor?.doctorId]);

  // Handle active conversation change with STRICT conversation isolation and race condition prevention
  useEffect(() => {
    if (!activeDoctor || !doctor) {
      setMessages([]);
      activeConversationIdRef.current = "";
      return;
    }

    const conversationId = getDeterministicConversationId(doctor.doctorId, activeDoctor.doctorId);
    activeConversationIdRef.current = conversationId;

    // CRITICAL: Immediately clear message state to prevent cross-conversation leaking
    setMessages([]);
    setChatError(null);
    setLoadingChat(true);

    // Cancel any previous in-flight conversation fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    loadConversationMessages(conversationId, activeDoctor, controller.signal);

    return () => {
      controller.abort();
    };
  }, [activeDoctor?.doctorId, doctor?.doctorId]);

  // Scroll to bottom on message update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingChat]);

  const loadConversations = async () => {
    try {
      setLoadingList(true);
      const res = await messageApi.getConversations();
      if (res.success) {
        const list = res.conversations || [];
        setConversations(list);

        // Decrypt last messages for preview in directory list
        if (doctor?.doctorId) {
          decryptPreviews(list, doctor.doctorId);
        }

        // Auto-select first conversation if none selected
        if (!activeDoctor && list.length > 0) {
          setActiveDoctor(list[0].doctor);
        }
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    } finally {
      setLoadingList(false);
    }
  };

  // Helper to asynchronously decrypt last message previews in sidebar
  const decryptPreviews = async (list, myDocId) => {
    const previews = {};
    for (const item of list) {
      if (item.lastMessage && item.lastMessage.ciphertext && item.doctor.publicKey) {
        try {
          const dec = await decryptMessage(
            myDocId,
            item.doctor.publicKey,
            item.lastMessage.ciphertext,
            item.lastMessage.nonce
          );
          previews[item.conversationId] = dec;
        } catch {
          previews[item.conversationId] = "[Encrypted Message]";
        }
      }
    }
    setLastMessagePreviews((prev) => ({ ...prev, ...previews }));
  };

  const loadConversationMessages = async (conversationId, peerDoctor, signal) => {
    try {
      // 1. Ensure peer's public key is known
      let peerKey = peerDoctor.publicKey;
      if (!peerKey) {
        const keyRes = await messageApi.getPublicKey(peerDoctor.doctorId, { signal });
        if (keyRes.success && keyRes.publicKey) {
          peerKey = keyRes.publicKey;
        }
      }
      setPeerPublicKey(peerKey);

      // 2. Fetch isolated messages strictly by deterministic conversationId
      const res = await messageApi.getConversationMessages(conversationId, { signal });

      // Guard: Discard response if user has already switched to another conversation
      if (signal.aborted || activeConversationIdRef.current !== conversationId) {
        return;
      }

      if (res.success) {
        const rawMessages = res.messages || [];

        // 3. Client-side local decryption of all messages using X25519-XSalsa20-Poly1305
        const decryptedList = await Promise.all(
          rawMessages.map(async (m) => {
            if (m.ciphertext && m.nonce && peerKey) {
              const decrypted = await decryptMessage(
                doctor.doctorId,
                peerKey,
                m.ciphertext,
                m.nonce
              );
              return { ...m, decryptedContent: decrypted };
            }
            return {
              ...m,
              decryptedContent: m.content || "[Encrypted Message]"
            };
          })
        );

        // Guard check again after async decryption
        if (activeConversationIdRef.current !== conversationId) {
          return;
        }

        setMessages(decryptedList);

        // Clear unread badge in conversation list for this exact conversation
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === conversationId ? { ...c, unreadCount: 0 } : c
          )
        );
      }
    } catch (e) {
      if (e.name === "AbortError" || signal.aborted) {
        // Ignored: request cancelled because doctor switched
        return;
      }
      console.error("Failed to load conversation messages:", e);
      if (activeConversationIdRef.current === conversationId) {
        setChatError(e.message || "Failed to load messages for this conversation.");
      }
    } finally {
      if (activeConversationIdRef.current === conversationId) {
        setLoadingChat(false);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeDoctor || !doctor || sending) return;

    const plaintext = inputContent.trim();
    const currentConvId = getDeterministicConversationId(doctor.doctorId, activeDoctor.doctorId);

    // Resolve peer public key
    let targetPeerKey = peerPublicKey || activeDoctor.publicKey;
    if (!targetPeerKey) {
      try {
        const keyRes = await messageApi.getPublicKey(activeDoctor.doctorId);
        if (keyRes.success && keyRes.publicKey) {
          targetPeerKey = keyRes.publicKey;
          setPeerPublicKey(targetPeerKey);
        }
      } catch (err) {
        alert("Unable to retrieve recipient's public key for encryption.");
        return;
      }
    }

    if (!targetPeerKey) {
      alert("Recipient doctor does not have an active public key registered.");
      return;
    }

    setInputContent("");
    setSending(true);

    try {
      // 1. CLIENT-SIDE ENCRYPTION: Encrypt locally before sending to server
      const enc = await encryptMessage(doctor.doctorId, targetPeerKey, plaintext);

      // 2. SEND ONLY CIPHERTEXT AND NONCE TO SERVER (Never send plaintext)
      const res = await messageApi.sendEncryptedMessage({
        conversationId: currentConvId,
        recipientDoctorId: activeDoctor.doctorId,
        ciphertext: enc.ciphertext,
        nonce: enc.nonce,
        algorithm: enc.algorithm
      });

      if (res.success && res.data) {
        const newMessage = {
          ...res.data,
          decryptedContent: plaintext
        };

        // Append to UI only if still viewing the same conversation
        if (activeConversationIdRef.current === currentConvId) {
          setMessages((prev) => [...prev, newMessage]);
        }

        // Update last message and preview in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === currentConvId
              ? { ...c, lastMessage: res.data }
              : c
          )
        );
        setLastMessagePreviews((prev) => ({
          ...prev,
          [currentConvId]: plaintext
        }));
      }
    } catch (err) {
      alert(err.message || "Failed to deliver end-to-end encrypted message.");
    } finally {
      setSending(false);
    }
  };

  const handleDoctorClick = (targetDoctor) => {
    if (activeDoctor?.doctorId === targetDoctor.doctorId) return;
    setActiveDoctor(targetDoctor);
  };

  const filteredConversations = conversations.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.doctor.name.toLowerCase().includes(q) ||
      c.doctor.doctorId.toLowerCase().includes(q) ||
      c.doctor.department.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, margin: 0, color: "#4C1D95", letterSpacing: "-0.01em" }}>
            Doctor-to-Doctor Secure Clinical Chat
          </h2>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              backgroundColor: "#FAF5FF",
              color: "#7C3AED",
              border: "1px solid #E9D5FF",
              borderRadius: "9999px",
              padding: "2px 10px",
              fontSize: "0.72rem",
              fontWeight: 700
            }}
          >
            <Lock size={11} />
            <span>End-to-End Encrypted</span>
          </span>
        </div>
        <p style={{ fontSize: "0.825rem", color: "#6B6472", margin: "4px 0 0" }}>
          Zero-knowledge, client-encrypted 1-to-1 practitioner messaging for confidential case consultations and clinical handover.
        </p>
      </div>

      {/* Main 2-Panel Chat Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          height: "calc(100vh - 200px)",
          minHeight: 520,
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #E9D5FF",
          boxShadow: "0 4px 20px rgba(76, 29, 149, 0.05)",
          overflow: "hidden"
        }}
      >
        {/* Left Panel: Search & Doctor Conversations */}
        <div
          style={{
            borderRight: "1px solid #E9D5FF",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff"
          }}
        >
          {/* Search Doctors */}
          <div style={{ padding: "14px", borderBottom: "1px solid #E9D5FF", backgroundColor: "#FAF5FF" }}>
            <div style={{ position: "relative" }}>
              <Search
                size={14}
                color="#8B5CF6"
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 32, fontSize: "0.825rem", backgroundColor: "#ffffff", borderColor: "#E9D5FF" }}
                placeholder="Search doctors by name or dept..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingList ? (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "#6B6472", fontSize: "0.825rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Loader2 size={16} className="animate-spin" color="#7C3AED" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "#6B6472", fontSize: "0.825rem" }}>
                No doctor accounts match your query.
              </div>
            ) : (
              filteredConversations.map((item) => {
                const isSelected = activeDoctor?.doctorId === item.doctor.doctorId;
                const preview = lastMessagePreviews[item.conversationId];

                return (
                  <div
                    key={item.doctor.doctorId}
                    onClick={() => handleDoctorClick(item.doctor)}
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #F5EEFF",
                      backgroundColor: isSelected ? "#FAF5FF" : "#ffffff",
                      borderLeft: isSelected ? "3px solid #7C3AED" : "3px solid transparent",
                      cursor: "pointer",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <img
                      src={item.doctor.avatar}
                      alt={item.doctor.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "9999px",
                        objectFit: "cover",
                        border: isSelected ? "2px solid #7C3AED" : "1px solid #E9D5FF"
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: isSelected ? "#4C1D95" : "#2D2438" }}>
                          {item.doctor.name}
                        </span>
                        {item.unreadCount > 0 && (
                          <span
                            style={{
                              backgroundColor: "#7C3AED",
                              color: "#ffffff",
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              borderRadius: "9999px",
                              padding: "1px 7px"
                            }}
                          >
                            {item.unreadCount}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "0.72rem", color: "#7C3AED", fontWeight: 600 }}>
                        {item.doctor.specialization} ({item.doctor.doctorId})
                      </div>

                      {item.lastMessage && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#6B6472",
                            marginTop: 3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          <Lock size={10} color="#8B5CF6" />
                          <span>{preview || "Encrypted message"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Active 1-to-1 Chat Room */}
        <div style={{ display: "flex", flexDirection: "column", backgroundColor: "#FAFAFF" }}>
          {activeDoctor ? (
            <>
              {/* Chat Header */}
              <div
                style={{
                  height: 64,
                  padding: "0 20px",
                  borderBottom: "1px solid #E9D5FF",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img
                    src={activeDoctor.avatar}
                    alt={activeDoctor.name}
                    style={{ width: 38, height: 38, borderRadius: "9999px", objectFit: "cover", border: "1px solid #E9D5FF" }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#4C1D95" }}>
                      {activeDoctor.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6B6472" }}>
                      {activeDoctor.specialization} • {activeDoctor.department} ({activeDoctor.doctorId})
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: "#059669", fontWeight: 600 }}>
                  <ShieldCheck size={16} />
                  <span>E2EE Active (X25519)</span>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                {loadingChat ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B6472", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <Loader2 size={24} className="animate-spin" color="#7C3AED" />
                    <span style={{ fontSize: "0.85rem" }}>Loading and decrypting conversation...</span>
                  </div>
                ) : chatError ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#DC2626", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <AlertCircle size={28} />
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{chatError}</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B6472" }}>
                    <MessageSquare size={32} color="#8B5CF6" style={{ margin: "0 auto 10px", opacity: 0.6 }} />
                    <div style={{ fontWeight: 600, color: "#4C1D95" }}>No messages yet with {activeDoctor.name}</div>
                    <p style={{ fontSize: "0.8rem", maxWidth: 320, margin: "6px auto 0" }}>
                      This conversation is private and end-to-end encrypted. Messages sent here are encrypted on your device and can only be read by {activeDoctor.name}.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = (m.senderDoctorId || m.senderId) === doctor.doctorId;
                    return (
                      <div
                        key={m.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isMe ? "flex-end" : "flex-start",
                          maxWidth: "75%",
                          alignSelf: isMe ? "flex-end" : "flex-start"
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 15px",
                            borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            backgroundColor: isMe ? "#7C3AED" : "#FAF5FF",
                            color: isMe ? "#ffffff" : "#2D2438",
                            border: isMe ? "none" : "1px solid #E9D5FF",
                            boxShadow: isMe ? "0 2px 10px rgba(124, 58, 237, 0.2)" : "0 2px 6px rgba(76, 29, 149, 0.04)",
                            fontSize: "0.85rem",
                            lineHeight: 1.45,
                            wordBreak: "break-word"
                          }}
                        >
                          {m.decryptedContent || "[Encrypted Message]"}
                        </div>

                        <div
                          style={{
                            fontSize: "0.68rem",
                            color: "#6B6472",
                            marginTop: 4,
                            display: "flex",
                            alignItems: "center",
                            gap: 4
                          }}
                        >
                          <Lock size={10} color={isMe ? "#7C3AED" : "#8B5CF6"} />
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {isMe && <CheckCheck size={12} color="#7C3AED" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "12px 18px",
                  borderTop: "1px solid #E9D5FF",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  gap: 10
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Send confidential message to ${activeDoctor.name}...`}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  style={{ flex: 1, backgroundColor: "#FAF5FF", borderColor: "#E9D5FF", borderRadius: "10px" }}
                />
                <button
                  type="submit"
                  disabled={!inputContent.trim() || sending}
                  className="btn btn-primary"
                  style={{ padding: "0 20px", borderRadius: "10px", display: "flex", alignItems: "center", gap: 6 }}
                >
                  {sending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  <span>{sending ? "Encrypting..." : "Send"}</span>
                </button>
              </form>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#6B6472" }}>
              Select a doctor from the directory on the left to start a private clinical chat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;

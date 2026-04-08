import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Spinner from "../components/Spinner";

const SOCKET_URL = "http://localhost:5000";

export default function Conversation() {
  const { listingId, otherUserId } = useParams();
  const { user }                   = useAuth();
  const navigate                   = useNavigate();

  const [messages, setMessages]   = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const [otherUser, setOtherUser] = useState(null);
  const [listing, setListing]     = useState(null);

  const socketRef  = useRef(null);
  const bottomRef  = useRef(null); // auto-scroll anchor
  const inputRef   = useRef(null);

  // Load existing messages + listing info
  useEffect(() => {
    Promise.all([
      axios.get(`/api/messages/${listingId}/${otherUserId}`),
      axios.get(`/api/listings/${listingId}`),
    ])
      .then(([msgRes, listingRes]) => {
        setMessages(msgRes.data.messages);
        setListing(listingRes.data.listing);

        // Get other user's name from messages or listing
        const otherMsg = msgRes.data.messages.find(
          m => m.sender_id !== user?.id
        );
        if (otherMsg) {
          setOtherUser({ id: Number(otherUserId), name: otherMsg.sender_name });
        } else {
          setOtherUser({
            id: Number(otherUserId),
            name: listingRes.data.listing.lister_name || "User",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [listingId, otherUserId, user?.id]);

  // Connect to Socket.io and join the conversation room
  useEffect(() => {
    if (!user) return;

    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      // Join the specific room for this conversation
      socketRef.current.emit("join_conversation", {
        listingId:   Number(listingId),
        userId:      user.id,
        otherUserId: Number(otherUserId),
      });
    });

    // Listen for incoming messages
    socketRef.current.on("receive_message", (message) => {
      setMessages(prev => {
        // Prevent duplicates — check if message ID already exists
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, listingId, otherUserId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await axios.post("/api/messages", {
        receiver_id: Number(otherUserId),
        listing_id:  Number(listingId),
        content:     newMessage.trim(),
      });

      const message = res.data.message;

      // Emit to Socket.io so the other user sees it instantly
      socketRef.current?.emit("send_message", message);

      setNewMessage("");
      inputRef.current?.focus();
    } catch {
      // silent fail — message didn't send
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.centered}><Spinner size={28} /></div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      {/* Conversation header */}
      <div style={styles.header}>
        <button onClick={() => navigate("/messages")} style={styles.backBtn}>←</button>
        <div style={styles.headerInfo}>
          <div style={styles.avatar}>
            {otherUser?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={styles.headerName}>{otherUser?.name}</div>
            {listing && (
              <div style={styles.headerListing}>
                Re: {listing.title}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages list */}
      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <div style={styles.emptyConv}>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender_id === user?.id;
            const showDate = i === 0 || (
              new Date(msg.created_at).toDateString() !==
              new Date(messages[i - 1].created_at).toDateString()
            );

            return (
              <div key={msg.id}>
                {showDate && (
                  <div style={styles.dateDivider}>
                    {new Date(msg.created_at).toLocaleDateString("en-US", {
                      weekday: "long", month: "short", day: "numeric",
                    })}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: "8px" }}>
                  <div style={{
                    ...styles.bubble,
                    background: isMe ? "#16a34a" : "var(--surface)",
                    color: isMe ? "white" : "var(--text-primary)",
                    borderBottomRightRadius: isMe ? "4px" : "16px",
                    borderBottomLeftRadius: isMe ? "16px" : "4px",
                    border: isMe ? "none" : "1px solid var(--border)",
                  }}>
                    <p style={styles.bubbleText}>{msg.content}</p>
                    <span style={{
                      ...styles.bubbleTime,
                      color: isMe ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
                    }}>
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} style={styles.inputBar}>
        <input
            ref={inputRef}
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
                }
            }}
            placeholder="Type a message..."
            style={styles.input}
            disabled={sending}
            autoFocus
            />
        <button
          type="submit"
          style={{
            ...styles.sendBtn,
            opacity: (!newMessage.trim() || sending) ? 0.5 : 1,
          }}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? <Spinner size={16} color="white" /> : "Send"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: { minHeight: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column" },
  centered: { display: "flex", justifyContent: "center", alignItems: "center", flex: 1 },
  header: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "12px 1.5rem",
    background: "var(--surface)",
    borderBottom: "1px solid var(--border)",
    position: "sticky", top: "56px", zIndex: 9,
  },
  backBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-secondary)", padding: "4px 8px" },
  headerInfo: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 500 },
  headerName: { fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" },
  headerListing: { fontSize: "12px", color: "var(--text-secondary)" },
  messageList: { flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", maxWidth: "640px", width: "100%", margin: "0 auto" },
  emptyConv: { textAlign: "center", color: "var(--text-muted)", fontSize: "13px", padding: "2rem" },
  dateDivider: { textAlign: "center", fontSize: "11px", color: "var(--text-muted)", margin: "16px 0 8px", background: "var(--bg)" },
  bubble: { maxWidth: "75%", padding: "10px 14px", borderRadius: "16px" },
  bubbleText: { fontSize: "14px", lineHeight: 1.5, margin: 0 },
  bubbleTime: { fontSize: "10px", display: "block", marginTop: "4px", textAlign: "right" },
  inputBar: {
    display: "flex", gap: "10px", padding: "12px 1.5rem",
    background: "var(--surface)", borderTop: "1px solid var(--border)",
    position: "sticky", bottom: 0,
    maxWidth: "640px", width: "100%", margin: "0 auto",
  },
  input: { flex: 1, padding: "10px 14px", borderRadius: "20px", border: "1px solid var(--border)", fontSize: "14px", background: "var(--bg)", color: "var(--text-primary)", outline: "none" },
  sendBtn: { padding: "10px 20px", borderRadius: "20px", border: "none", background: "#16a34a", color: "white", fontSize: "14px", fontWeight: 500, cursor: "pointer" },
};
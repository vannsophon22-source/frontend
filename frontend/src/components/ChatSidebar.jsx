// Add to your ChatSidebar component
const [toasts, setToasts] = useState([]);

const addToast = (message, type = "info") => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, message, type }]);
};

const removeToast = (id) => {
  setToasts(prev => prev.filter(t => t.id !== id));
};

// Listen for new messages (you'll need WebSocket for real-time)
// When a new message arrives from someone else:
// addToast(`New message from ${senderName}`, "info");

// In ChatSidebar component
const { permission, requestPermission, showNotification } = useNotifications();

// Request permission when user first opens chat
useEffect(() => {
  if (permission === "default") {
    // Show a nice UI prompt instead of immediate browser popup
    setShowPermissionPrompt(true);
  }
}, [permission]);

// When a new message arrives from another user
const onNewMessage = (message, senderName) => {
  // 1. Show in-app toast
  addToast(`New message from ${senderName}`, "info");
  
  // 2. Show browser notification if app is not focused
  if (document.hidden) {
    showNotification(senderName, {
      body: message.message?.substring(0, 100),
      icon: "/avatar-placeholder.png",
      tag: `chat-${selectedUser?.id}`,
      onClick: () => {
        // Focus the chat with this user
        setSelectedUser({ id: message.sender_id, name: senderName });
      }
    });
  }
};
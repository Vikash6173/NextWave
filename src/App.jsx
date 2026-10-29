import React, { useEffect, useRef, useState } from "react";

const USERS = ["Alan", "Bob", "Carol", "Dean", "Elin"];
const EMOJIS = ["😊", "😂", "❤️", "🙌", "🎉", "👀", "✨", "👍"];
const INITIAL_MESSAGES = [
  {
    id: 1,
    user: "Carol",
    text: "Hey everyone! Welcome to the chat 👋",
    time: "10:42 AM",
    likes: 2,
  },
  {
    id: 2,
    user: "Alan",
    text: "This little corner of the internet feels nice.",
    time: "10:43 AM",
    likes: 1,
  },
  {
    id: 3,
    user: "Elin",
    text: "Agreed! What’s everyone working on today? ✨",
    time: "10:44 AM",
    likes: 0,
  },
];

function getTime() {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

function Avatar({ name, small = false }) {
  return (
    <span
      aria-hidden="true"
      className={`avatar avatar-${name.toLowerCase()}${small ? " avatar-small" : ""}`}
    >
      {name.slice(0, 1)}
    </span>
  );
}

function App() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [likedMessages, setLikedMessages] = useState([]);
  const [activePeople, setActivePeople] = useState(4);
  const threadRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const thread = threadRef.current;
    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }
  }, [messages]);

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const user = USERS[Math.floor(Math.random() * USERS.length)];
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `${Date.now()}-${Math.random()}`,
        user,
        text,
        time: getTime(),
        likes: 0,
      },
    ]);
    setDraft("");
    setShowEmojis(false);
    setShowMentions(false);
    setActivePeople((count) => Math.min(count + 1, USERS.length));
    inputRef.current?.focus();
  }

  function toggleLike(id) {
    setLikedMessages((currentLikes) =>
      currentLikes.includes(id)
        ? currentLikes.filter((messageId) => messageId !== id)
        : [...currentLikes, id],
    );
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === id
          ? {
              ...message,
              likes: message.likes + (likedMessages.includes(id) ? -1 : 1),
            }
          : message,
      ),
    );
  }

  function addEmoji(emoji) {
    setDraft((currentDraft) => `${currentDraft}${emoji}`);
    setShowEmojis(false);
    inputRef.current?.focus();
  }

  function addMention(user) {
    setDraft((currentDraft) => {
      const trimmed = currentDraft.trimEnd();
      const withoutAt = trimmed.endsWith("@") ? trimmed.slice(0, -1) : trimmed;
      return `${withoutAt}${withoutAt ? " " : ""}@${user} `;
    });
    setShowMentions(false);
    inputRef.current?.focus();
  }

  function handleDraftChange(event) {
    const nextDraft = event.target.value;
    setDraft(nextDraft);
    setShowMentions(/(^|\s)@$/.test(nextDraft));
  }

  return (
    <main className="page-shell">
      <section aria-label="Chat room" className="chat-card">
        <header className="room-header">
          <div className="room-heading">
            <div className="room-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 11.5h8M8 8.5h5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <h1>The little chat room</h1>
              <p>A friendly place to say hello</p>
            </div>
          </div>
          <div className="online-count" title={`${activePeople} people here`}>
            <span className="online-dot" />
            {activePeople} here
          </div>
        </header>

        <div className="thread" ref={threadRef} aria-live="polite">
          <div className="day-divider">
            <span />
            <p>Today</p>
            <span />
          </div>
          {messages.map((message) => {
            const liked = likedMessages.includes(message.id);
            return (
              <article className="message" key={message.id}>
                <Avatar name={message.user} />
                <div className="message-content">
                  <div className="message-meta">
                    <span className="message-name">{message.user}</span>
                    <time>{message.time}</time>
                  </div>
                  <div className="message-row">
                    <p className="message-bubble">{message.text}</p>
                    <button
                      aria-label={`${liked ? "Unlike" : "Like"} message from ${message.user}`}
                      aria-pressed={liked}
                      className={`like-button${liked ? " is-liked" : ""}`}
                      onClick={() => toggleLike(message.id)}
                      type="button"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 10v10H4V10h3Zm3 10h7.2a2 2 0 0 0 1.96-1.6l1.2-6A2 2 0 0 0 18.4 10H14l.67-3.32a1.5 1.5 0 0 0-2.57-1.3L7 10v10h3Z" />
                      </svg>
                      <span>{message.likes}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <form className="composer" onSubmit={sendMessage}>
          <label className="sr-only" htmlFor="message-input">
            Write a message
          </label>
          <div className="input-wrap">
            <input
              autoComplete="off"
              id="message-input"
              onChange={handleDraftChange}
              placeholder="Write something nice..."
              ref={inputRef}
              value={draft}
            />
            <div className="composer-actions">
              <div className="popover-anchor">
                <button
                  aria-expanded={showEmojis}
                  aria-label="Choose an emoji"
                  className={`tool-button${showEmojis ? " tool-active" : ""}`}
                  onClick={() => {
                    setShowEmojis((visible) => !visible);
                    setShowMentions(false);
                  }}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle
                      cx="12"
                      cy="12"
                      r="8.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8.5 14.2s1.2 1.8 3.5 1.8 3.5-1.8 3.5-1.8M9 9.5h.01M15 9.5h.01"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {showEmojis && (
                  <div aria-label="Emoji options" className="emoji-popover">
                    {EMOJIS.map((emoji) => (
                      <button
                        aria-label={`Add ${emoji}`}
                        key={emoji}
                        onClick={() => addEmoji(emoji)}
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                aria-label="Mention a user"
                className="tool-button mention-tool"
                onClick={() => {
                  setShowMentions((visible) => !visible);
                  setShowEmojis(false);
                  setDraft((currentDraft) =>
                    currentDraft.endsWith("@") ? currentDraft : `${currentDraft}@`,
                  );
                  inputRef.current?.focus();
                }}
                type="button"
              >
                @
              </button>
            </div>
            {showMentions && (
              <div aria-label="Mention a user" className="mention-popover">
                <p>Pick someone to mention</p>
                {USERS.map((user) => (
                  <button
                    key={user}
                    onClick={() => addMention(user)}
                    type="button"
                  >
                    <Avatar name={user} small />
                    {user}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="send-button" disabled={!draft.trim()} type="submit">
            <span>Send</span>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 10h13m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>
        <p className="composer-hint">Press Enter to send</p>
      </section>
      <p className="page-note">A little kindness goes a long way ☀️</p>
    </main>
  );
}

export default App;

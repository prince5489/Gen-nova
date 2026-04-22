// 


import { createContext, useState, useCallback } from "react";
import main from "../config/gemini.js";

export const context = createContext();

const MAX_HISTORY = 50;
const STORAGE_KEY = "gemini_chat_history";

// ── helpers ──────────────────────────────────────────────────────────────────

const genId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const loadFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveToStorage = (chats) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chats.slice(0, MAX_HISTORY)));
    } catch {
        // storage quota exceeded — fail silently
    }
};

// ── provider ─────────────────────────────────────────────────────────────────

const ContextProvider = ({ children }) => {

    // ── state ────────────────────────────────────────────────────────────────

    const [chatHistory, setChatHistory]         = useState(loadFromStorage);   // [{ id, title, messages[], createdAt }]
    const [activeChatId, setActiveChatId]       = useState(null);
    const [currentMessages, setCurrentMessages] = useState([]);                // [{ role:"user"|"model", text, timestamp }]
    const [loading, setLoading]                 = useState(false);
    const [error, setError]                     = useState(null);
    const [input, setInput]                     = useState("");

    // ── derived ──────────────────────────────────────────────────────────────

    const recentPrompts = chatHistory
        .flatMap((c) => c.messages.filter((m) => m.role === "user").map((m) => m.text))
        .slice(0, 10);

    // ── chat management ──────────────────────────────────────────────────────

    /** Persist updated chat list and update state */
    const persistChats = useCallback((updater) => {
        setChatHistory((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;
            saveToStorage(next);
            return next;
        });
    }, []);

    /** Start a brand-new blank conversation */
    const newChat = useCallback(() => {
        setActiveChatId(null);
        setCurrentMessages([]);
        setError(null);
        setInput("");
    }, []);

    /** Load a past conversation into the active view */
    const loadChat = useCallback((id) => {
        const chat = chatHistory.find((c) => c.id === id);
        if (!chat) return;
        setActiveChatId(id);
        setCurrentMessages(chat.messages);
        setError(null);
    }, [chatHistory]);

    /** Delete a conversation from history */
    const deleteChat = useCallback((id) => {
        persistChats((prev) => prev.filter((c) => c.id !== id));
        if (activeChatId === id) newChat();
    }, [activeChatId, newChat, persistChats]);

    /** Rename a conversation */
    const renameChat = useCallback((id, newTitle) => {
        persistChats((prev) =>
            prev.map((c) => c.id === id ? { ...c, title: newTitle } : c)
        );
    }, [persistChats]);

    /** Clear ALL history */
    const clearHistory = useCallback(() => {
        persistChats([]);
        newChat();
    }, [newChat, persistChats]);

    // ── send / regenerate ─────────────────────────────────────────────────────

    const _callAPI = useCallback(async (prompt, history = []) => {
        // Build a multi-turn context string so Gemini "remembers" the conversation
        const contextLines = history
            .slice(-10) // last 5 pairs to stay within token limits
            .map((m) => `${m.role === "user" ? "User" : "Gemini"}: ${m.text}`)
            .join("\n");

        const fullPrompt = contextLines
            ? `${contextLines}\nUser: ${prompt}\nGemini:`
            : prompt;

        return await main(fullPrompt);
    }, []);

    /** Core send — accepts an optional prompt override (used by regenerate / suggestions) */
    const onSent = useCallback(async (promptOverride) => {
        const prompt = (promptOverride ?? input).trim();
        if (!prompt || loading) return;

        setLoading(true);
        setError(null);
        setInput("");

        // Optimistic user bubble
        const userMsg = { role: "user", text: prompt, timestamp: Date.now() };
        const nextMessages = [...currentMessages, userMsg];
        setCurrentMessages(nextMessages);

        try {
            const result = await _callAPI(prompt, currentMessages);

            const modelMsg = { role: "model", text: result, timestamp: Date.now() };
            const finalMessages = [...nextMessages, modelMsg];
            setCurrentMessages(finalMessages);

            // Upsert into chat history
            persistChats((prev) => {
                const existingIndex = prev.findIndex((c) => c.id === activeChatId);
                if (existingIndex !== -1) {
                    // update existing chat
                    const updated = [...prev];
                    updated[existingIndex] = { ...updated[existingIndex], messages: finalMessages };
                    return updated;
                } else {
                    // create new chat entry
                    const newEntry = {
                        id: genId(),
                        title: prompt.slice(0, 60),
                        messages: finalMessages,
                        createdAt: Date.now(),
                    };
                    setActiveChatId(newEntry.id);
                    return [newEntry, ...prev];
                }
            });

        } catch (err) {
            console.error("Gemini API error:", err);
            setError(err?.message ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [input, loading, currentMessages, activeChatId, _callAPI, persistChats]);

    /** Regenerate the last model response */
    const regenerate = useCallback(async () => {
        if (loading) return;
        const lastUserMsg = [...currentMessages].reverse().find((m) => m.role === "user");
        if (!lastUserMsg) return;

        // Strip last model response so we don't duplicate it
        const trimmed = currentMessages.slice(0, currentMessages.lastIndexOf(lastUserMsg) + 1);
        setCurrentMessages(trimmed);

        await onSent(lastUserMsg.text);
    }, [loading, currentMessages, onSent]);

    /** Stop an in-flight request (best-effort — aborts UI loading state) */
    const stopGeneration = useCallback(() => {
        setLoading(false);
    }, []);

    // ── suggestions ───────────────────────────────────────────────────────────

    const suggestions = [
        { icon: "💡", label: "Explain a concept", prompt: "Explain how neural networks learn in simple terms" },
        { icon: "✍️", label: "Write something",   prompt: "Write a short poem about the ocean at night" },
        { icon: "🧑‍💻", label: "Help with code",  prompt: "How do I debounce a function in JavaScript?" },
        { icon: "📋", label: "Make a plan",       prompt: "Create a 30-day fitness plan for a beginner" },
    ];

    // ── context value ─────────────────────────────────────────────────────────

    const contextValue = {
        // state
        input,
        setInput,
        loading,
        error,
        currentMessages,
        chatHistory,
        activeChatId,
        recentPrompts,
        suggestions,

        // actions
        onSent,
        newChat,
        loadChat,
        deleteChat,
        renameChat,
        clearHistory,
        regenerate,
        stopGeneration,
    };

    return (
        <context.Provider value={contextValue}>
            {children}
        </context.Provider>
    );
};

export default ContextProvider;
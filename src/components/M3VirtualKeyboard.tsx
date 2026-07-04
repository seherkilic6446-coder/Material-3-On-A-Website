import React, { useState, useEffect, useRef } from "react";
import {
  Smile,
  Clipboard,
  Settings,
  Languages,
  Mic,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowRight,
  Delete,
  Volume2,
  VolumeX,
  Sparkles,
  Search,
  Check,
  Globe
} from "lucide-react";

interface M3VirtualKeyboardProps {
  onKeyPress?: (key: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  className?: string;
  isFloating?: boolean;
  onClose?: () => void;
  targetInputId?: string;
}

const COMMON_SUGGESTIONS: Record<string, string[]> = {
  "": ["Android", "material", "I"],
  "a": ["Android", "app", "about", "active"],
  "an": ["Android", "animation", "angry", "another"],
  "m": ["material", "mode", "mobile", "making"],
  "ma": ["material", "maps", "matrix", "matching"],
  "mat": ["material", "matrix", "mathematics", "matter"],
  "s": ["selection", "slider", "switch", "style"],
  "sl": ["slider", "slide", "sleep", "slow"],
  "sw": ["switch", "swipe", "swift", "sweet"],
  "b": ["button", "baseline", "beautiful", "bottom"],
  "bu": ["button", "build", "bubble", "busy"],
  "k": ["keyboard", "keycap", "kitten", "keeps"],
  "g": ["gboard", "google", "great", "green"],
};

export const M3VirtualKeyboard: React.FC<M3VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onEnter,
  className = "",
  isFloating = false,
  onClose,
  targetInputId
}) => {
  const [layout, setLayout] = useState<"qwerty" | "symbols" | "emojis">("qwerty");
  const [isShift, setIsShift] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [typedWord, setTypedWord] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(["Android", "material", "I"]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<"recent" | "faces" | "objects" | "nature">("faces");

  // Audio Context for key clicks
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "triangle";
      // Soft click frequency
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context block by browser security or not supported
    }
  };

  const triggerVibration = () => {
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch (e) {}
    }
  };

  // Keyboard action trigger
  const handleAction = () => {
    playClickSound();
    triggerVibration();
  };

  // Update suggestions dynamically
  useEffect(() => {
    const lowercaseWord = typedWord.toLowerCase().trim();
    if (lowercaseWord === "") {
      setSuggestions(COMMON_SUGGESTIONS[""]);
      return;
    }

    // Check direct matches
    if (COMMON_SUGGESTIONS[lowercaseWord]) {
      setSuggestions(COMMON_SUGGESTIONS[lowercaseWord]);
      return;
    }

    // Try finding prefix matches
    const keys = Object.keys(COMMON_SUGGESTIONS).filter(k => k !== "");
    const matchingKey = keys.find(k => lowercaseWord.startsWith(k) || k.startsWith(lowercaseWord));
    if (matchingKey) {
      setSuggestions(COMMON_SUGGESTIONS[matchingKey]);
    } else {
      // Fallback custom generated suggestions
      setSuggestions([typedWord, typedWord + "s", typedWord + "ing"]);
    }
  }, [typedWord]);

  // Insert character to target element or sandbox
  const insertCharacter = (char: string) => {
    handleAction();
    
    // Find active element or target
    const activeEl = targetInputId 
      ? (document.getElementById(targetInputId) as HTMLInputElement) 
      : (document.activeElement as HTMLInputElement | HTMLTextAreaElement | null);

    const isInputField = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

    if (isInputField && activeEl) {
      const start = activeEl.selectionStart ?? 0;
      const end = activeEl.selectionEnd ?? 0;
      const originalValue = activeEl.value;
      const newValue = originalValue.substring(0, start) + char + originalValue.substring(end);
      
      activeEl.value = newValue;
      activeEl.selectionStart = activeEl.selectionEnd = start + char.length;
      
      // Trigger input event for React state binding
      const event = new Event("input", { bubbles: true });
      activeEl.dispatchEvent(event);
      activeEl.focus();
    }

    if (onKeyPress) {
      onKeyPress(char);
    }

    // Build current typed word for suggestion bar
    if (char === " " || char === "." || char === ",") {
      setTypedWord("");
    } else {
      setTypedWord(prev => prev + char);
    }

    // Release Shift after single keypress if not Caps Locked
    if (isShift && !isCapsLock) {
      setIsShift(false);
    }
  };

  const handleBackspacePress = () => {
    handleAction();

    const activeEl = targetInputId 
      ? (document.getElementById(targetInputId) as HTMLInputElement) 
      : (document.activeElement as HTMLInputElement | HTMLTextAreaElement | null);

    const isInputField = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

    if (isInputField && activeEl) {
      const start = activeEl.selectionStart ?? 0;
      const end = activeEl.selectionEnd ?? 0;
      const originalValue = activeEl.value;
      
      if (start > 0 || end > start) {
        const deleteCount = end > start ? 0 : 1;
        const newValue = originalValue.substring(0, start - deleteCount) + originalValue.substring(end);
        
        activeEl.value = newValue;
        activeEl.selectionStart = activeEl.selectionEnd = start - deleteCount;
        
        const event = new Event("input", { bubbles: true });
        activeEl.dispatchEvent(event);
        activeEl.focus();
      }
    }

    if (onBackspace) {
      onBackspace();
    }

    setTypedWord(prev => prev.slice(0, -1));
  };

  const handleEnterPress = () => {
    handleAction();

    const activeEl = targetInputId 
      ? (document.getElementById(targetInputId) as HTMLInputElement) 
      : (document.activeElement as HTMLInputElement | HTMLTextAreaElement | null);

    if (activeEl) {
      // Trigger keydown or submit form if possible, or just click off focus
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      activeEl.dispatchEvent(event);
    }

    if (onEnter) {
      onEnter();
    }

    setTypedWord("");
  };

  const applySuggestion = (word: string) => {
    handleAction();
    const activeEl = targetInputId 
      ? (document.getElementById(targetInputId) as HTMLInputElement) 
      : (document.activeElement as HTMLInputElement | HTMLTextAreaElement | null);

    const isInputField = activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

    if (isInputField && activeEl) {
      const start = activeEl.selectionStart ?? 0;
      const originalValue = activeEl.value;
      
      // Delete the currently typed word segment
      const wordLength = typedWord.length;
      const beforeWord = originalValue.substring(0, start - wordLength);
      const afterWord = originalValue.substring(start);
      
      // Append completed word plus trailing space
      const newValue = beforeWord + word + " " + afterWord;
      activeEl.value = newValue;
      activeEl.selectionStart = activeEl.selectionEnd = beforeWord.length + word.length + 1;
      
      const event = new Event("input", { bubbles: true });
      activeEl.dispatchEvent(event);
      activeEl.focus();
    }
    
    setTypedWord("");
  };

  const toggleShift = () => {
    handleAction();
    if (isShift && !isCapsLock) {
      // Double tap toggles caps lock
      setIsCapsLock(true);
    } else if (isCapsLock) {
      setIsCapsLock(false);
      setIsShift(false);
    } else {
      setIsShift(true);
    }
  };

  // Keyboard rows data
  const qwertyRows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"]
  ];

  const symbolRows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["@", "#", "$", "%", "&", "-", "+", "(", ")", "/"],
    ["*", "\"", "'", ":", ";", "!", "?", "\\", "_", "="],
    ["~", "`", "|", "<", ">", "{", "}", "[", "]"]
  ];

  const emojisList = {
    faces: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"],
    objects: ["💻", "📱", "⌚", "⌨️", "🖱️", "🖨️", "💾", "💿", "🎥", "📺", "📷", "💡", "🔦", "🔋", "🔌", "⚙️", "🔧", "🔨", "🔩", "🔒", "🔑", "📦", "✉️", "✏️", "✒️", "📝", "📁", "📅", "📊", "📈", "🗑️", "💵", "💳", "🔔", "📣", "🎨", "🎭", "🎮", "🎸", "🎷", "🎺", "⚽", "🏀", "🏈", "🏆", "🚗", "🚲", "✈️"],
    nature: ["🌸", "💮", "🌹", "🌺", "🌻", "🌼", "🌷", "🌱", "🌲", "🌳", "🌴", "🌵", "🌿", "🍀", "🍁", "🍂", "🍃", "🍄", "🐚", "🐌", "🐜", "🐝", "🐞", "🦋", "🐟", "🐬", "🐳", "🐵", "🦁", "🐯", "🐱", "🐶", "🐺", "🦊", "🐻", "🐼", "🐨", "🐰", "🐭", "🐿️", "🦉", "🦅", "🦆", "🦎", "🐍", "🦖", "🦕"],
    recent: ["👍", "🔥", "✨", "💖", "🎉", "🚀", "💻", "🎨", "⭐", "🌈", "☕", "🍕", "🍔", "🍿", "🎈", "🎁", "👏", "🙌", "💯", "✅"]
  };

  return (
    <div
      className={`select-none transition-all duration-300 w-full flex flex-col font-sans p-2 rounded-[28px] border border-[var(--m3-outline-variant)] shadow-lg 
        ${isFloating ? "fixed bottom-0 left-0 right-0 z-50 animate-slide-up max-w-2xl mx-auto mb-4 bg-[#f3f4ec] dark:bg-[#1c1d1a]" : "bg-[#f3f4ec] dark:bg-[#1c1d1a]"} 
        ${className}`}
    >
      {/* FLOAT MODE HEADER */}
      {isFloating && (
        <div className="flex items-center justify-between px-4 pb-2 border-b border-[var(--m3-outline-variant)] mb-1 opacity-70">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--m3-on-surface-variant)]">
            <Sparkles className="h-4 w-4 text-[var(--m3-primary)] animate-pulse" />
            <span>M3 Gboard IME Active</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[var(--m3-primary)] hover:underline"
          >
            Hide
          </button>
        </div>
      )}

      {/* TOP BAR: GBOARD UTILITY TOOLBAR */}
      <div className="flex items-center justify-between px-2 py-1 text-[var(--m3-on-surface-variant)] border-b border-dashed border-[var(--m3-outline-variant)] border-opacity-40 mb-1">
        <div className="flex items-center gap-3">
          {/* Sticker */}
          <button className="p-1.5 hover:bg-[#e4e7e0] dark:hover:bg-[#2c2d2a] rounded-full transition-colors">
            <Smile className="h-4 w-4" />
          </button>
          
          {/* GIF icon */}
          <button className="flex items-center justify-center p-0.5 px-1.5 border border-[var(--m3-outline)] rounded-md hover:bg-[#e4e7e0] dark:hover:bg-[#2c2d2a] font-bold text-[10px] tracking-wide transition-colors">
            GIF
          </button>
          
          {/* Clipboard */}
          <button className="p-1.5 hover:bg-[#e4e7e0] dark:hover:bg-[#2c2d2a] rounded-full transition-colors">
            <Clipboard className="h-4 w-4" />
          </button>
          
          {/* Settings */}
          <button className="p-1.5 hover:bg-[#e4e7e0] dark:hover:bg-[#2c2d2a] rounded-full transition-colors">
            <Settings className="h-4 w-4" />
          </button>
          
          {/* Language Translate */}
          <button className="p-1.5 hover:bg-[#e4e7e0] dark:hover:bg-[#2c2d2a] rounded-full transition-colors">
            <Languages className="h-4 w-4" />
          </button>
          
          {/* Mic */}
          <button className="p-1.5 hover:bg-[#e4e7e0] dark:hover:bg-[#2c2d2a] rounded-full transition-colors">
            <Mic className="h-4 w-4" />
          </button>

          {/* Ellipsis */}
          <button className="p-1.5 hover:bg-[#e4e7e0] dark:hover:bg-[#2c2d2a] rounded-full transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Audio control widget inside keyboard */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 hover:bg-[#e4e7e0] dark:hover:bg-[#2c2d2a] rounded-full transition-colors"
            title={soundEnabled ? "Mute key sound" : "Unmute key sound"}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-[var(--m3-primary)]" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
            )}
          </button>
        </div>
      </div>

      {/* SUGGESTION STRIP */}
      {layout !== "emojis" && (
        <div className="flex items-center px-2 py-1 gap-2 border-b border-[var(--m3-outline-variant)] border-opacity-25 mb-1.5 h-11">
          {/* Chevron down indicator on the left */}
          <button className="p-1 text-neutral-400 dark:text-neutral-500">
            <ChevronDown className="h-4 w-4" />
          </button>
          
          {/* Suggestion capsules */}
          <div className="flex-1 flex items-center justify-around gap-2 px-1">
            {suggestions.map((word, i) => {
              // Gboard highlights the middle option typically, or matches what we saw in the spec image:
              // - "Android" (light green)
              // - "material" (active green)
              // - "I" (light green)
              const isMiddle = i === 1;
              return (
                <button
                  key={word + "-" + i}
                  onClick={() => applySuggestion(word)}
                  className={`flex-1 max-w-[130px] truncate text-center py-1.5 px-3 rounded-full text-xs font-semibold transition-all duration-150 transform hover:scale-[1.03] active:scale-[0.97]
                    ${
                      isMiddle
                        ? "bg-[#c2ebd0] text-[#134e2c] dark:bg-[#386a4d] dark:text-[#c2ebd0]"
                        : "bg-[#e5e8e1] text-[#434843] dark:bg-[#2d2f2c] dark:text-[#c4c7c3]"
                    }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* EMOJI CONTAINER */}
      {layout === "emojis" && (
        <div className="flex flex-col h-[210px] bg-[#fafbfa] dark:bg-[#252623] rounded-[20px] p-2 mb-1.5 border border-[var(--m3-outline-variant)] border-opacity-30">
          {/* Emoji Category Navigation Bar */}
          <div className="flex items-center gap-1.5 pb-2 mb-1.5 border-b border-neutral-100 dark:border-neutral-800 text-[11px] font-bold">
            <button
              onClick={() => setActiveEmojiCategory("recent")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                activeEmojiCategory === "recent" ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveEmojiCategory("faces")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                activeEmojiCategory === "faces" ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Smileys
            </button>
            <button
              onClick={() => setActiveEmojiCategory("objects")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                activeEmojiCategory === "objects" ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Objects
            </button>
            <button
              onClick={() => setActiveEmojiCategory("nature")}
              className={`px-2.5 py-1 rounded-full transition-all ${
                activeEmojiCategory === "nature" ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]" : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              Nature
            </button>
            <div className="ml-auto">
              <button
                onClick={() => setLayout("qwerty")}
                className="text-[var(--m3-primary)] hover:underline flex items-center gap-1 pr-1"
              >
                ABC Keyboard
              </button>
            </div>
          </div>

          {/* Emoji Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-8 gap-1.5 p-1 content-start scrollbar-thin">
            {emojisList[activeEmojiCategory].map((emoji, index) => (
              <button
                key={emoji + "-" + index}
                onClick={() => insertCharacter(emoji)}
                className="h-10 text-2xl flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-transform active:scale-90"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QWERTY LAYOUT */}
      {layout === "qwerty" && (
        <div className="flex flex-col gap-1.5">
          {/* Row 1 (Numbers) */}
          <div className="flex w-full justify-between gap-1">
            {qwertyRows[0].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => insertCharacter(num)}
                className="flex-1 h-[42px] min-w-[24px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#1c1d1a] dark:text-[#fafbfa] rounded-[10px] text-sm font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Row 2 (Letters row 1) */}
          <div className="flex w-full justify-between gap-1">
            {qwertyRows[1].map((letter) => {
              const char = isShift || isCapsLock ? letter.toUpperCase() : letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => insertCharacter(char)}
                  className="flex-1 h-[42px] min-w-[24px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#1c1d1a] dark:text-[#fafbfa] rounded-[10px] text-sm font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
                >
                  {char}
                </button>
              );
            })}
          </div>

          {/* Row 3 (Letters row 2) */}
          <div className="flex w-full justify-center gap-1 px-[4%]">
            {qwertyRows[2].map((letter) => {
              const char = isShift || isCapsLock ? letter.toUpperCase() : letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => insertCharacter(char)}
                  className="flex-1 h-[42px] min-w-[24px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#1c1d1a] dark:text-[#fafbfa] rounded-[10px] text-sm font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
                >
                  {char}
                </button>
              );
            })}
          </div>

          {/* Row 4 (Shift, Letters row 3, Backspace) */}
          <div className="flex w-full justify-between gap-1">
            {/* Shift Key */}
            <button
              type="button"
              onClick={toggleShift}
              className={`w-[12%] h-[42px] flex items-center justify-center rounded-[10px] shadow-sm transition-all active:scale-95
                ${
                  isCapsLock
                    ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:brightness-115"
                    : isShift
                    ? "bg-[#c2ebd0] text-[#134e2c] dark:bg-[#386a4d] dark:text-[#c2ebd0]"
                    : "bg-[#e5e8e1] dark:bg-[#1a1c19] text-[#434843] dark:text-[#c4c7c3] hover:bg-[#dfe1dd] dark:hover:bg-[#252724]"
                }`}
            >
              <ArrowUp className={`h-4.5 w-4.5 ${isCapsLock ? "stroke-[3]" : "stroke-[2]"}`} />
              {isCapsLock && <div className="absolute bottom-1 w-1.5 h-1.5 bg-white rounded-full" />}
            </button>

            {/* Standard characters */}
            {qwertyRows[3].map((letter) => {
              const char = isShift || isCapsLock ? letter.toUpperCase() : letter;
              return (
                <button
                  key={letter}
                  type="button"
                  onClick={() => insertCharacter(char)}
                  className="flex-1 h-[42px] min-w-[24px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#1c1d1a] dark:text-[#fafbfa] rounded-[10px] text-sm font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
                >
                  {char}
                </button>
              );
            })}

            {/* Backspace Key */}
            <button
              type="button"
              onClick={handleBackspacePress}
              className="w-[12%] h-[42px] bg-[#e5e8e1] dark:bg-[#1a1c19] text-[#434843] dark:text-[#c4c7c3] hover:bg-[#dfe1dd] dark:hover:bg-[#252724] rounded-[10px] shadow-sm transition-all active:scale-95 flex items-center justify-center"
            >
              <Delete className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* SYMBOLS LAYOUT */}
      {layout === "symbols" && (
        <div className="flex flex-col gap-1.5">
          {/* Row 1 */}
          <div className="flex w-full justify-between gap-1">
            {symbolRows[0].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => insertCharacter(sym)}
                className="flex-1 h-[42px] min-w-[24px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#1c1d1a] dark:text-[#fafbfa] rounded-[10px] text-sm font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex w-full justify-between gap-1">
            {symbolRows[1].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => insertCharacter(sym)}
                className="flex-1 h-[42px] min-w-[24px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#1c1d1a] dark:text-[#fafbfa] rounded-[10px] text-sm font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Row 3 */}
          <div className="flex w-full justify-between gap-1">
            {symbolRows[2].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => insertCharacter(sym)}
                className="flex-1 h-[42px] min-w-[24px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#1c1d1a] dark:text-[#fafbfa] rounded-[10px] text-sm font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Row 4 */}
          <div className="flex w-full justify-between gap-1 px-[2%]">
            <button
              type="button"
              onClick={() => setLayout("qwerty")}
              className="w-[15%] h-[42px] bg-[#e5e8e1] dark:bg-[#1a1c19] text-[#434843] dark:text-[#c4c7c3] hover:bg-[#dfe1dd] dark:hover:bg-[#252724] rounded-[10px] text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              1/2
            </button>
            {symbolRows[3].map((sym) => (
              <button
                key={sym}
                type="button"
                onClick={() => insertCharacter(sym)}
                className="flex-1 h-[42px] min-w-[24px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#1c1d1a] dark:text-[#fafbfa] rounded-[10px] text-sm font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
              >
                {sym}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspacePress}
              className="w-[15%] h-[42px] bg-[#e5e8e1] dark:bg-[#1a1c19] text-[#434843] dark:text-[#c4c7c3] hover:bg-[#dfe1dd] dark:hover:bg-[#252724] rounded-[10px] shadow-sm transition-all active:scale-95 flex items-center justify-center"
            >
              <Delete className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM ROW (COMMON CONTROLS) */}
      <div className="flex w-full justify-between gap-1 mt-2 px-0.5">
        {/* Layout switcher button (?123) */}
        <button
          type="button"
          onClick={() => {
            handleAction();
            setLayout(layout === "qwerty" ? "symbols" : "qwerty");
          }}
          className="w-[15%] h-[44px] bg-[#e5e8e1] dark:bg-[#1a1c19] text-[#434843] dark:text-[#c4c7c3] hover:bg-[#dfe1dd] dark:hover:bg-[#252724] rounded-[12px] text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center"
        >
          {layout === "qwerty" ? "123" : "abc"}
        </button>

        {/* Emoji Icon Button */}
        <button
          type="button"
          onClick={() => {
            handleAction();
            setLayout(layout === "emojis" ? "qwerty" : "emojis");
          }}
          className="w-[10%] h-[44px] bg-[#e5e8e1] dark:bg-[#1a1c19] text-[#434843] dark:text-[#c4c7c3] hover:bg-[#dfe1dd] dark:hover:bg-[#252724] rounded-[12px] shadow-sm transition-all active:scale-95 flex items-center justify-center"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Comma / Voice Icon Button */}
        <button
          type="button"
          onClick={() => insertCharacter(",")}
          className="w-[10%] h-[44px] bg-[#e5e8e1] dark:bg-[#1a1c19] text-[#434843] dark:text-[#c4c7c3] hover:bg-[#dfe1dd] dark:hover:bg-[#252724] rounded-[12px] shadow-sm transition-all active:scale-95 flex flex-col items-center justify-center relative"
        >
          <span className="text-xs font-bold leading-none">,</span>
          <Mic className="h-3 w-3 absolute bottom-1 text-neutral-400 dark:text-neutral-500" />
        </button>

        {/* Spacebar - Pill Shape matching Gboard perfectly */}
        <button
          type="button"
          onClick={() => insertCharacter(" ")}
          className="flex-1 h-[44px] bg-[#fafbfa] dark:bg-[#2d2f2c] hover:bg-[#f1f2ef] dark:hover:bg-[#3d3f3c] text-[#434843] dark:text-[#c4c7c3] rounded-[24px] text-xs font-semibold shadow-sm transition-all active:scale-[0.98] flex items-center justify-between px-4"
        >
          <ChevronLeft className="h-3 w-3 opacity-40" />
          <span className="tracking-wide">en/tr</span>
          <ChevronRight className="h-3 w-3 opacity-40" />
        </button>

        {/* Period Key */}
        <button
          type="button"
          onClick={() => insertCharacter(".")}
          className="w-[10%] h-[44px] bg-[#e5e8e1] dark:bg-[#1a1c19] text-[#434843] dark:text-[#c4c7c3] hover:bg-[#dfe1dd] dark:hover:bg-[#252724] rounded-[12px] shadow-sm transition-all active:scale-95 flex flex-col items-center justify-center relative"
        >
          <span className="text-sm font-bold">.</span>
          <span className="text-[7px] font-bold absolute bottom-0.5 text-neutral-400 dark:text-neutral-500">!?</span>
        </button>

        {/* Enter Key - Vibrant dynamic green pill with arrow */}
        <button
          type="button"
          onClick={handleEnterPress}
          className="w-[15%] h-[44px] bg-[#a6d7b1] text-[#134e2c] dark:bg-[#386a4d] dark:text-[#c2ebd0] hover:brightness-105 active:scale-95 rounded-[12px] shadow-md flex items-center justify-center transition-all"
        >
          <ArrowRight className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

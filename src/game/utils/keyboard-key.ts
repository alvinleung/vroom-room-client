type KeyboardKey =
  // Control keys
  | "Backspace"
  | "Tab"
  | "Enter"
  | "Shift"
  | "Control"
  | "Alt"
  | "Pause"
  | "CapsLock"
  | "Escape"
  | "Space"
  | "PageUp"
  | "PageDown"
  | "End"
  | "Home"
  | "ArrowLeft"
  | "ArrowUp"
  | "ArrowRight"
  | "ArrowDown"
  | "PrintScreen"
  | "Insert"
  | "Delete"

  // Modifier keys
  | "Meta"
  | "ContextMenu"
  | "NumLock"
  | "ScrollLock"

  // Function keys
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12"
  | "F13"
  | "F14"
  | "F15"
  | "F16"
  | "F17"
  | "F18"
  | "F19"
  | "F20"
  | "F21"
  | "F22"
  | "F23"
  | "F24"

  // Digits
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"

  // Letters
  | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j"
  | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t"
  | "u" | "v" | "w" | "x" | "y" | "z"

  // Numpad keys
  | "NumPad0"
  | "NumPad1"
  | "NumPad2"
  | "NumPad3"
  | "NumPad4"
  | "NumPad5"
  | "NumPad6"
  | "NumPad7"
  | "NumPad8"
  | "NumPad9"
  | "NumPadMultiply"
  | "NumPadAdd"
  | "NumPadSubtract"
  | "NumPadDecimal"
  | "NumPadDivide"
  | "NumPadEnter"

  // Punctuation & symbols
  | "`" | "-" | "=" | "[" | "]" | "\\" | ";" | "'" | "," | "." | "/"
  | "~" | "!" | "@" | "#" | "$" | "%" | "^" | "&" | "*" | "(" | ")"
  | "_" | "+" | "{" | "}" | "|" | ":" | "\"" | "<" | ">" | "?"

  // IME & composition
  | "Dead"
  | "Unidentified"
  | "Process"
  | "Compose"

  // Media keys (some browsers may support these)
  | "MediaTrackNext"
  | "MediaTrackPrevious"
  | "MediaStop"
  | "MediaPlayPause"
  | "AudioVolumeMute"
  | "AudioVolumeUp"
  | "AudioVolumeDown"

  // Browser keys
  | "BrowserBack"
  | "BrowserForward"
  | "BrowserRefresh"
  | "BrowserStop"
  | "BrowserSearch"
  | "BrowserFavorites"
  | "BrowserHome"


  export default KeyboardKey;

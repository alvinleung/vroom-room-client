import KeyboardKey from "./utils/keyboard-key";

/**
 * Active keymap stores the millisecond when the key was active,
 * when it is not active, the time become "undefined".
 */
export type ActiveKeyMap = Map<KeyboardKey, number | undefined>;

export namespace Input {
  export function createKeyboardProvider(): ActiveKeyMap {
    const activeKey: ActiveKeyMap = new Map();

    window.addEventListener("keydown", (e) => {
      const now = performance.now();
      activeKey.set(e.key as KeyboardKey, now);
    });
    window.addEventListener("keyup", (e) => {
      activeKey.set(e.key as KeyboardKey, undefined);
    });

    return activeKey;
  }

  export function getAxis(
    keyboard: ActiveKeyMap,
    positive: KeyboardKey,
    negative: KeyboardKey,
  ): number {
    const positiveKeyPressTime = keyboard.get(positive);
    const negativeKeyPressTime = keyboard.get(negative);

    if (
      positiveKeyPressTime === undefined &&
      negativeKeyPressTime === undefined
    ) {
      return 0;
    }

    if (negativeKeyPressTime === undefined) {
      return 1;
    }

    if (positiveKeyPressTime === undefined) {
      return -1;
    }

    // case when both keys are pressed on the keyboard, last press wins
    if (positiveKeyPressTime > negativeKeyPressTime) {
      return 1;
    }
    return -1;
  }
}

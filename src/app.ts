import { init, update } from "./game/game";
import { tryCatch } from "./game/utils/try-catch";

// begin the game loop here
(async () => {
  const [game, err] = await tryCatch(init());
  if (err) {
    console.error(err);
    return;
  }

  let animFrame;
  const loop = () => {
    update(game);
    animFrame = requestAnimationFrame(loop);
  };

  animFrame = requestAnimationFrame(loop);
})();

export function createResizableCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  canvas.style.position = "fixed";
  canvas.style.inset = "";
  
  document.body.appendChild(canvas);

  const context = canvas.getContext("2d");
  if (!context) throw "unable create context";

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener("resize", resize);

  return { canvas, context, resize };
}

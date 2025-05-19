import { ActiveKeyMap } from "./input";

export interface UserState {
  id: string;
  name: string;
  x: number;
  y: number;
  velX: number;
  velY: number;
  color: string;
  message: string;  
}



export function renderUser(context:CanvasRenderingContext2D, user:UserState) {
  context.fillStyle = user.color;
  context.fillRect(user.x, user.y, 24, 24);
}

import kaplay from "kaplay";
import "kaplay/global";

const k = kaplay({ width: 1280, height: 720, letterbox: true, background: [128, 180, 255], debug: true });

k.loadSprite("bean", "sprites/bean.png");

k.add([k.pos(120, 80), k.sprite("bean")]);

k.onClick(() => k.addKaboom(k.mousePos()));

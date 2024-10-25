import kaplay from "kaplay";
import "kaplay/global";

kaplay({ width: 1280, height: 720, letterbox: true, background: [0, 0, 0], debug: true });

loadSprite("bag", "/sprites/bag.png");
loadSprite("ghosty", "/sprites/ghosty.png");
loadSprite("grass", "/sprites/grass.png");
loadSprite("steel", "/sprites/steel.png");
loadSprite("door", "/sprites/door.png");
loadSprite("meat", "/sprites/meat.png");
loadSprite("bean", "/sprites/bean.png");
loadSprite("chefhatlarge", "/sprites/chefhatlarge.png");
loadSprite("chefhatsmall", "/sprites/chefhatsmall.png");
loadFont("刀隶体", "/fonts/AlimamaDaoLiTi.ttf");

scene("main", levelIdx => {
  const SPEED = 320;

  // character dialog data
  const characters = {
    a: {
      sprite: "bag",
      msg: "新来的厨房帮工是吗？帮忙煮锅肉汤。",
      id: "chef"
    },
    b: {
      sprite: "ghosty",
      msg: "Who are you? You can see me??"
    }
  };

  // level layouts
  const levels = [
    [
      "===|====", //
      "=      =", //
      "= $    =", //
      "=    a =", //
      "=      =", //
      "=   @  =", //
      "========" //
    ],
    [
      "--------", //
      "-      -", //
      "-   $  -", //
      "|      -", //
      "-    b -", //
      "-  @   -", //
      "--------" //
    ]
  ];

  const level = addLevel(levels[levelIdx], {
    tileWidth: 64,
    tileHeight: 64,
    pos: vec2(64, 64),
    tiles: {
      "=": () => [sprite("grass"), area(), body({ isStatic: true }), anchor("center")],
      "-": () => [sprite("steel"), area(), body({ isStatic: true }), anchor("center")],
      $: () => [sprite("meat"), area(), anchor("center"), "meat"],
      "@": () => [sprite("bean"), area(), body(), anchor("center"), "player"],
      "|": () => [sprite("door"), area(), body({ isStatic: true }), anchor("center"), "door"]
    },
    // any() is a special function that gets called everytime there's a
    // symbole not defined above and is supposed to return what that symbol
    // means
    wildcardTile(ch) {
      const char = characters[ch];
      if (char) {
        return [sprite(char.sprite), area(), body({ isStatic: true }), anchor("center"), char.id || "character", { msg: char.msg }];
      }
    }
  });

  // get the player game obj by tag
  const player = level.get("player")[0];
  player.add([pos(0, -16), sprite("chefhatlarge"), anchor("bot")])

  // get chef bag by tag
  const chef = level.get("chef")[0]
  chef.add([pos(12, -18), sprite("chefhatsmall"), anchor("bot")])

  function addDialog() {
    const h = 160;
    const pad = 16;
    const bg = add([pos(0, height() - h), rect(width(), h), color(0, 0, 0), z(100)]);
    const txt = add([
      text("", {
        width: width(),
        font: "刀隶体"
      }),
      pos(0 + pad, height() - h + pad),
      z(100)
    ]);
    bg.hidden = true;
    txt.hidden = true;
    return {
      say(t) {
        txt.text = t;
        bg.hidden = false;
        txt.hidden = false;
      },
      dismiss() {
        if (!this.active()) {
          return;
        }
        txt.text = "";
        bg.hidden = true;
        txt.hidden = true;
      },
      active() {
        return !bg.hidden;
      },
      destroy() {
        bg.destroy();
        txt.destroy();
      }
    };
  }

  let hasMeat = false;
  const holdingMeat = make([pos(16, -16), sprite("meat"), anchor("top"), rotate(135)]);
  const dialog = addDialog();

  player.onCollide("door", () => {
    if (hasMeat) {
      if (levelIdx + 1 < levels.length) {
        go("main", levelIdx + 1);
      } else {
        go("win");
      }
    } else {
      dialog.say("you got no meat!");
    }
  });

  // talk on touch
  player.onCollide("character", ch => {
    dialog.say(ch.msg);
  });
  function interact() {
    const collisions = player.getCollisions();
    if (collisions.length == 0) {
      if (hasMeat) {
        console.log(hasMeat);
        player.remove(holdingMeat);
        hasMeat = false;
        level.add([sprite("meat"), pos(player.pos.add([0, 32])), area(), anchor("center"), "meat"]);
      }
    } else {
      for (const col of collisions) {
        const c = col.target;
        if (c.is("meat")) {
          destroy(c);
          player.add(holdingMeat);
          hasMeat = true;
        }
      }
    }
  }
  onKeyPress("space", interact);

  const dirs = {
    left: LEFT,
    right: RIGHT,
    up: UP,
    down: DOWN
  };

  for (const dir in dirs) {
    onKeyPress(dir, () => {
      dialog.dismiss();
    });
    onKeyDown(dir, () => {
      player.move(dirs[dir].scale(SPEED));
    });
  }
});

scene("win", () => {
  add([text("You Win!", { font: "刀隶体" }), pos(width() / 2, height() / 2), anchor("center")]);
});

go("main", 0);

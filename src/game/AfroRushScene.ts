// AfroRushScene.ts — Core Phaser 3 race scene.
// Single-scene top-down racer: player okada, scrolling road, obstacles,
// pickups, random African-flavoured events, 4 race modes, style scoring.

import * as Phaser from "phaser";
import { getItem, type Loadout, type RaceMode } from "@/lib/storage";

export interface HudState {
  distance: number;
  speedKmh: number;
  nitro: number; // 0..1
  score: number;
  style: number;
  cashEarned: number;
  repEarned: number;
  packages: number;
  packagesTarget: number;
  goalProgress: number; // 0..1
  chaseTime: number; // seconds remaining
  event: string | null;
  combo: number;
  countdown: number | null; // 3,2,1,0(null)
}

export interface RaceResult {
  mode: RaceMode;
  finished: boolean;
  distance: number;
  score: number;
  style: number;
  cashEarned: number;
  repEarned: number;
  durationMs: number;
  reason: "finished" | "crashed" | "caught" | "quit";
  newHighScore: boolean;
  prevHighScore: number;
  packages: number;
}

export interface RaceConfig {
  mode: RaceMode;
  loadout: Loadout;
  bikeColor: string;
  outfitColor: string;
  exhaustColor: string;
  soundOn: boolean;
  onHud: (hud: HudState) => void;
  onBanner: (text: string, color?: string) => void;
  onEnd: (result: RaceResult) => void;
}

// Bike stat multipliers keyed by bike id.
const BIKE_STATS: Record<string, { accel: number; topSpeed: number; grip: number; nitroDrain: number }> = {
  "bike-spark":   { accel: 1.0,  topSpeed: 1.0,  grip: 1.0,  nitroDrain: 1.0  },
  "bike-bolt":    { accel: 1.2,  topSpeed: 0.95, grip: 1.0,  nitroDrain: 1.0  },
  "bike-pulse":   { accel: 0.85, topSpeed: 1.25, grip: 0.9,  nitroDrain: 1.0  },
  "bike-mirage":  { accel: 1.0,  topSpeed: 1.05, grip: 1.2,  nitroDrain: 0.95 },
  "bike-phantom": { accel: 1.05, topSpeed: 1.0,  grip: 1.0,  nitroDrain: 0.7  },
  "bike-suya":    { accel: 1.2,  topSpeed: 1.2,  grip: 1.15, nitroDrain: 0.6  },
};

const PICKUP_META: Record<string, { color: number; label: string; cash: number; rep: number; nitro?: number; boost?: number }> = {
  coin:    { color: 0xf2c531, label: "₦",   cash: 250, rep: 0  },
  suya:    { color: 0xd2601a, label: "SUYA", cash: 100, rep: 5, boost: 4 },
  jollof:  { color: 0xe94f37, label: "JOLLOF", cash: 200, rep: 10, nitro: 0.6 },
  style:   { color: 0x7c3aed, label: "★", cash: 0, rep: 25 },
};

const OBSTACLE_TYPES = ["danfo", "okada", "goat", "pothole", "pole"] as const;
type ObstacleType = (typeof OBSTACLE_TYPES)[number];

export default class AfroRushScene extends Phaser.Scene {
  private cfg!: RaceConfig;
  private bikeColorHex = 0xd2601a;
  private outfitColorHex = 0xf5f5f5;
  private exhaustColorHex = 0x9ca3af;
  private stats = BIKE_STATS["bike-spark"];

  // World
  private roadX = 0;
  private roadW = 480;
  private sky!: Phaser.GameObjects.Graphics;
  private roadGfx!: Phaser.GameObjects.Graphics;
  private stripeY = 0;

  // Movement
  private speed = 220;
  private targetSpeed = 220;
  private maxSpeed = 420;
  private boostMaxSpeed = 620;

  // Player
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private nitro = 1;
  private boosting = false;
  private braking = false;
  private leftHeld = false;
  private rightHeld = false;
  private boostHeld = false;
  private playerInvuln = 0;
  private exhaustTrailTimer = 0;

  // Style/combo
  private combo = 0;
  private comboTimer = 0;
  private style = 0;
  private cashEarned = 0;
  private repEarned = 0;
  private nearMissCooldown = 0;

  // Mode state
  private mode!: RaceMode;
  private distance = 0;
  private goalDistance = 3000;
  private chaseTime = 60;
  private packages = 0;
  private packagesTarget = 5;
  private modeStartTime = 0;

  // Status
  private crashed = false;
  private ended = false;
  private countdown = 3;
  private countdownTimer = 0;
  private playing = false;

  // Events
  private activeEvent: string | null = null;
  private eventTimer = 0;

  // Groups
  private obstacles!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private police!: Phaser.Physics.Arcade.Group;
  private banners: Phaser.GameObjects.Text[] = [];

  // Effects
  private blackoutGfx!: Phaser.GameObjects.Rectangle;
  private rainGfx!: Phaser.GameObjects.Graphics;
  private rainDrops: { x: number; y: number; vy: number }[] = [];

  // Audio
  private audioCtx: AudioContext | null = null;
  private boostLoop: { osc: OscillatorNode; gain: GainNode } | null = null;

  // HUD throttle
  private hudTimer = 0;

  // Keyboard
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyP!: Phaser.Input.Keyboard.Key;
  private keyH!: Phaser.Input.Keyboard.Key;

  constructor() {
    super("afrorush");
  }

  init(data: RaceConfig) {
    this.cfg = data;
    this.bikeColorHex = Phaser.Display.Color.HexStringToColor(data.bikeColor).color;
    this.outfitColorHex = Phaser.Display.Color.HexStringToColor(data.outfitColor).color;
    this.exhaustColorHex = Phaser.Display.Color.HexStringToColor(data.exhaustColor).color;
    this.stats = BIKE_STATS[data.loadout.bikeId] ?? BIKE_STATS["bike-spark"];

    this.speed = 220;
    this.targetSpeed = 220;
    this.maxSpeed = 420 * this.stats.topSpeed;
    this.boostMaxSpeed = 620 * this.stats.topSpeed;
    this.distance = 0;
    this.nitro = 1;
    this.boosting = false;
    this.braking = false;
    this.leftHeld = false;
    this.rightHeld = false;
    this.boostHeld = false;
    this.playerInvuln = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.style = 0;
    this.cashEarned = 0;
    this.repEarned = 0;
    this.packages = 0;
    this.crashed = false;
    this.ended = false;
    this.playing = false;
    this.countdown = 3;
    this.countdownTimer = 0;
    this.activeEvent = null;
    this.eventTimer = 0;

    this.mode = data.mode;
    this.goalDistance = 3000;
    this.chaseTime = 60;
    this.packagesTarget = 6;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.roadW = Math.min(W * 0.86, 520);
    this.roadX = (W - this.roadW) / 2;

    this.sky = this.add.graphics();
    this.drawBackground();

    this.roadGfx = this.add.graphics();
    this.drawRoad();

    this.obstacles = this.physics.add.group();
    this.pickups = this.physics.add.group();
    this.police = this.physics.add.group();

    this.createPlayer();

    this.physics.add.overlap(this.player, this.obstacles, this.onHitObstacle, undefined, this);
    this.physics.add.overlap(this.player, this.pickups, this.onPickup, undefined, this);
    if (this.mode === "police-chase") {
      this.physics.add.overlap(this.player, this.police, this.onCaughtByPolice, undefined, this);
    }

    this.blackoutGfx = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0)
      .setDepth(80)
      .setScrollFactor(0);
    this.rainGfx = this.add.graphics().setDepth(81).setScrollFactor(0);
    for (let i = 0; i < 80; i++) {
      this.rainDrops.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: 600 + Math.random() * 400,
      });
    }

    this.setupKeyboard();

    this.modeStartTime = this.time.now;

    this.time.addEvent({ delay: 850, loop: true, callback: this.spawnObstacle, callbackScope: this });
    this.time.addEvent({ delay: 1400, loop: true, callback: this.spawnPickup, callbackScope: this });
    this.time.addEvent({ delay: 11000, loop: true, callback: this.maybeTriggerEvent, callbackScope: this });

    if (this.mode === "police-chase") {
      this.time.addEvent({ delay: 3500, loop: true, callback: this.spawnPolice, callbackScope: this });
    }

    if (this.cfg.soundOn && typeof window !== "undefined") {
      try {
        this.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      } catch { /* ignore */ }
    }

    this.showBanner("3", "#f2c531");
    this.countdownTimer = 1.0;
  }

  // ---------- Drawing ----------

  private drawBackground() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.sky.clear();
    const top = Phaser.Display.Color.HexStringToColor("#2b1055");
    const mid = Phaser.Display.Color.HexStringToColor("#7c3aed");
    const bot = Phaser.Display.Color.HexStringToColor("#f97316");
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const c = t < 0.5
        ? Phaser.Display.Color.Interpolate.ColorWithColor(top, mid, 100, Math.round(t * 200))
        : Phaser.Display.Color.Interpolate.ColorWithColor(mid, bot, 100, Math.round((t - 0.5) * 200));
      const col = Phaser.Display.Color.GetColor(c.red, c.green, c.blue);
      this.sky.fillStyle(col, 1);
      this.sky.fillRect(0, (H / steps) * i, W, H / steps + 1);
    }
    // Distant city silhouette
    this.sky.fillStyle(0x1a0f33, 0.85);
    let x = 0;
    while (x < W) {
      const bw = 30 + Math.random() * 50;
      const bh = 40 + Math.random() * 90;
      this.sky.fillRect(x, H * 0.55 - bh, bw, bh);
      x += bw + 4;
    }
    // Sun
    this.sky.fillStyle(0xffd27f, 0.9);
    this.sky.fillCircle(W * 0.78, H * 0.32, 38);
    this.sky.fillStyle(0xffb347, 0.4);
    this.sky.fillCircle(W * 0.78, H * 0.32, 52);
  }

  private drawRoad() {
    const H = this.scale.height;
    this.roadGfx.clear();
    // Shoulders (sand)
    this.roadGfx.fillStyle(0xc2956b, 1);
    this.roadGfx.fillRect(0, 0, this.roadX, H);
    this.roadGfx.fillRect(this.roadX + this.roadW, 0, this.scale.width - this.roadX - this.roadW, H);
    // Asphalt
    this.roadGfx.fillStyle(0x1c1c22, 1);
    this.roadGfx.fillRect(this.roadX, 0, this.roadW, H);
    // Edge lines
    this.roadGfx.fillStyle(0xffffff, 0.9);
    this.roadGfx.fillRect(this.roadX + 6, 0, 4, H);
    this.roadGfx.fillRect(this.roadX + this.roadW - 10, 0, 4, H);
    // Center dashed lane markers
    const stripeH = 36;
    const gap = 24;
    const total = stripeH + gap;
    let y = -((this.stripeY % total + total) % total);
    this.roadGfx.fillStyle(0xf2c531, 0.95);
    const cx = this.roadX + this.roadW / 2;
    while (y < H) {
      this.roadGfx.fillRect(cx - 3, y, 6, stripeH);
      y += total;
    }
  }

  private createPlayer() {
    const W = this.scale.width;
    const H = this.scale.height;
    const bodyW = 30;
    const bodyH = 50;
    const bike = this.add.rectangle(0, 6, bodyW, bodyH, this.bikeColorHex)
      .setStrokeStyle(2, 0x111111);
    const bikeTop = this.add.rectangle(0, -8, 22, 14, this.bikeColorHex)
      .setStrokeStyle(2, 0x111111);
    const handle = this.add.rectangle(0, -16, 32, 4, 0x222222);
    const wheel1 = this.add.rectangle(0, -22, 6, 16, 0x111111);
    const wheel2 = this.add.rectangle(0, 22, 6, 16, 0x111111);
    const torso = this.add.rectangle(0, -4, 18, 18, this.outfitColorHex)
      .setStrokeStyle(2, 0x111111);
    const head = this.add.circle(0, -16, 7, 0x6b3f23).setStrokeStyle(2, 0x111111);
    const helmet = this.add.arc(0, -18, 7, 180, 360, false, this.exhaustColorHex, 0.6);

    this.player = this.add.container(W / 2, H - 110, [
      wheel1, wheel2, bike, bikeTop, handle, torso, head, helmet,
    ]);
    this.player.setDepth(50);

    this.physics.world.enable(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setSize(34, 54);
    this.playerBody.setOffset(-17, -27);
    this.playerBody.setCollideWorldBounds(false);
  }

  // ---------- Input ----------

  private setupKeyboard() {
    if (!this.input.keyboard) return;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
    this.keyP.on("down", () => this.togglePause());
    this.keyH.on("down", () => this.playHorn());
  }

  setControl(name: "left" | "right" | "boost" | "brake", pressed: boolean) {
    if (name === "left") this.leftHeld = pressed;
    if (name === "right") this.rightHeld = pressed;
    if (name === "boost") this.boostHeld = pressed;
    if (name === "brake") this.braking = pressed;
    if (pressed && name === "boost") this.tryStartBoost();
  }

  private togglePause() {
    if (this.ended || !this.playing) return;
    if (this.scene.isPaused()) {
      this.scene.resume();
      this.showBanner("GO!", "#1f9d55");
    } else {
      this.scene.pause();
      this.showBanner("PAUSED", "#7c3aed");
    }
  }

  // ---------- Spawning ----------

  private spawnObstacle() {
    if (!this.playing || this.ended) return;
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    let width = 36;
    let height = 50;
    let color = 0xf2c531;
    let alpha = 1;
    switch (type) {
      case "danfo":   width = 90; height = 80; color = 0xf2c531; break;
      case "okada":   width = 30; height = 50; color = 0x16a3b1; break;
      case "goat":    width = 28; height = 22; color = 0xf5f5f5; break;
      case "pothole": width = 60; height = 18; color = 0x111111; alpha = 0.7; break;
      case "pole":    width = 6;  height = 90; color = 0x6b4226; break;
    }
    const x = this.roadX + 20 + Math.random() * (this.roadW - 40 - width);
    const obj = this.add.rectangle(x, -height, width, height, color, alpha)
      .setStrokeStyle(type === "danfo" ? 3 : 2, 0x111111, alpha);
    if (type === "danfo") {
      this.add.rectangle(x, -height / 2 + 12, width - 8, 6, 0x16a3b1).setDepth(obj.depth + 1);
    }
    this.physics.world.enable(obj);
    const body = obj.body as Phaser.Physics.Arcade.Body;
    body.setSize(width, height);
    body.setAllowGravity(false);
    body.setImmovable(true);
    obj.setData("type", type);
    this.obstacles.add(obj);
  }

  private spawnPickup() {
    if (!this.playing || this.ended) return;
    const kinds = Object.keys(PICKUP_META);
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const meta = PICKUP_META[kind];
    const x = this.roadX + 30 + Math.random() * (this.roadW - 60);
    const orb = this.add.circle(x, -20, 16, meta.color, 1).setStrokeStyle(3, 0x111111);
    const label = this.add.text(x, -20, meta.label, {
      fontFamily: "Geist, sans-serif",
      fontSize: kind === "coin" ? "14px" : "9px",
      color: "#111111",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.tweens.add({ targets: [orb, label], scale: { from: 0.9, to: 1.1 }, duration: 500, yoyo: true, repeat: -1 });
    const cont = this.add.container(x, -20, [orb, label]);
    this.physics.world.enable(cont);
    const body = cont.body as Phaser.Physics.Arcade.Body;
    body.setSize(32, 32);
    body.setOffset(-16, -16);
    body.setAllowGravity(false);
    body.setImmovable(true);
    cont.setData("kind", kind);
    this.pickups.add(cont);
  }

  private spawnPolice() {
    if (!this.playing || this.ended) return;
    const x = this.roadX + 20 + Math.random() * (this.roadW - 60);
    const car = this.add.rectangle(x, this.scale.height + 60, 50, 80, 0x16a3b1)
      .setStrokeStyle(3, 0x111111);
    const light1 = this.add.rectangle(x - 10, this.scale.height + 60 - 25, 8, 6, 0xff0000);
    const light2 = this.add.rectangle(x + 10, this.scale.height + 60 - 25, 8, 6, 0x0000ff);
    this.tweens.add({
      targets: [light1, light2],
      alpha: { from: 1, to: 0.2 },
      duration: 200,
      yoyo: true,
      repeat: -1,
    });
    const cont = this.add.container(x, this.scale.height + 60, [car, light1, light2]);
    this.physics.world.enable(cont);
    const body = cont.body as Phaser.Physics.Arcade.Body;
    body.setSize(50, 80);
    body.setOffset(-25, -40);
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.setVelocityY(-260);
    this.police.add(cont);
  }

  private maybeTriggerEvent() {
    if (!this.playing || this.ended || this.activeEvent) return;
    const events = ["NEPA BLACKOUT", "HEAVY RAIN", "GOAT CROSSING", "DANFO BLOCK"];
    const ev = events[Math.floor(Math.random() * events.length)];
    this.triggerEvent(ev);
  }

  private triggerEvent(name: string) {
    this.activeEvent = name;
    this.eventTimer = name === "DANFO BLOCK" ? 1.5 : 4.5;
    this.cfg.onBanner(name, name === "NEPA BLACKOUT" ? "#222222" : "#f2c531");
    if (name === "NEPA BLACKOUT") {
      this.tweens.add({ targets: this.blackoutGfx, alpha: { from: 0, to: 0.78 }, duration: 200 });
    } else if (name === "HEAVY RAIN") {
      this.tweens.add({ targets: this.blackoutGfx, alpha: { from: 0, to: 0.18 }, duration: 200 });
    } else if (name === "GOAT CROSSING") {
      for (let i = 0; i < 4; i++) {
        const x = this.roadX + 30 + i * (this.roadW / 5);
        const obj = this.add.rectangle(x, -50 - i * 30, 28, 22, 0xf5f5f5, 1)
          .setStrokeStyle(2, 0x111111);
        this.physics.world.enable(obj);
        const body = obj.body as Phaser.Physics.Arcade.Body;
        body.setSize(28, 22);
        body.setAllowGravity(false);
        body.setImmovable(true);
        obj.setData("type", "goat");
        this.obstacles.add(obj);
      }
    } else if (name === "DANFO BLOCK") {
      const x = this.roadX + this.roadW / 2;
      const obj = this.add.rectangle(x, -80, this.roadW * 0.75, 80, 0xf2c531, 1)
        .setStrokeStyle(3, 0x111111);
      this.physics.world.enable(obj);
      const body = obj.body as Phaser.Physics.Arcade.Body;
      body.setSize(this.roadW * 0.75, 80);
      body.setAllowGravity(false);
      body.setImmovable(true);
      obj.setData("type", "danfo");
      this.obstacles.add(obj);
    }
  }

  private endEvent() {
    if (!this.activeEvent) return;
    if (this.activeEvent === "NEPA BLACKOUT" || this.activeEvent === "HEAVY RAIN") {
      this.tweens.add({ targets: this.blackoutGfx, alpha: 0, duration: 300 });
    }
    this.activeEvent = null;
    this.eventTimer = 0;
  }

  // ---------- Update ----------

  update(_time: number, dtMs: number) {
    const dt = Math.min(dtMs / 1000, 0.05);

    if (!this.playing && !this.ended) {
      this.countdownTimer -= dt;
      if (this.countdownTimer <= 0) {
        this.countdown--;
        if (this.countdown > 0) {
          this.showBanner(String(this.countdown), "#f2c531");
          this.countdownTimer = 1.0;
          this.playTone(440, 0.1);
        } else {
          this.showBanner("GO!", "#1f9d55");
          this.playTone(880, 0.18);
          this.playing = true;
        }
      }
      this.stripeY += 60 * dt;
      this.drawRoad();
      return;
    }

    if (this.ended) return;
    if (this.scene.isPaused()) return;

    if (this.crashed) {
      this.speed = Math.max(0, this.speed - 600 * dt);
      this.scrollWorld(dt * 0.4);
      this.hudTimer += dt;
      if (this.hudTimer >= 0.1) { this.hudTimer = 0; this.emitHud(); }
      return;
    }

    this.handleInput(dt);
    this.updateSpeed(dt);

    this.distance += (this.speed / 28) * dt;

    if (this.boosting && this.nitro > 0) {
      this.nitro = Math.max(0, this.nitro - dt * 0.42 * this.stats.nitroDrain);
      if (this.nitro <= 0) this.boosting = false;
    } else {
      this.nitro = Math.min(1, this.nitro + dt * 0.16);
    }

    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    if (this.activeEvent) {
      this.eventTimer -= dt;
      if (this.eventTimer <= 0) this.endEvent();
    }

    if (this.playerInvuln > 0) this.playerInvuln -= dt;

    this.updateMode(dt);

    this.scrollWorld(dt);

    if (this.activeEvent === "HEAVY RAIN") this.drawRain(dt);

    if (this.boosting) this.spawnExhaust();

    this.hudTimer += dt;
    if (this.hudTimer >= 0.1) { this.hudTimer = 0; this.emitHud(); }
  }

  private handleInput(dt: number) {
    const left = this.cursors?.left.isDown || this.keyA.isDown || this.leftHeld;
    const right = this.cursors?.right.isDown || this.keyD.isDown || this.rightHeld;
    const boost = this.cursors?.up.isDown || this.keySpace.isDown || this.boostHeld;
    const brake = this.cursors?.down.isDown || this.keyShift.isDown || this.braking;

    if (boost) this.tryStartBoost();
    else this.boosting = false;

    this.braking = brake;

    const grip = (this.activeEvent === "HEAVY RAIN" ? 0.55 : 1) * this.stats.grip;
    const move = 380 * grip * dt;
    let vx = 0;
    if (left) vx -= move;
    if (right) vx += move;
    this.playerBody.setVelocityX(vx);

    if ((left || right) && this.speed > 360 && this.activeEvent !== "HEAVY RAIN") {
      this.addStyle("drift", 0.5 * dt);
    }
  }

  private tryStartBoost() {
    if (this.nitro > 0.05 && !this.boosting) {
      this.boosting = true;
      this.cameras.main.flash(120, 255, 180, 60);
      this.playBoostLoop(true);
    } else if (this.nitro <= 0.05) {
      this.boosting = false;
    }
  }

  private updateSpeed(dt: number) {
    if (this.boosting) {
      this.targetSpeed = this.boostMaxSpeed;
    } else if (this.braking) {
      this.targetSpeed = 140;
    } else {
      this.targetSpeed = this.maxSpeed;
    }
    const diff = this.targetSpeed - this.speed;
    this.speed += diff * dt * (this.boosting ? 2.4 : 1.6);
    if (Math.abs(diff) < 1) this.speed = this.targetSpeed;

    if (this.boosting) this.addStyle("wheelie", 1.2 * dt);
  }

  private scrollWorld(dt: number) {
    this.stripeY += this.speed * dt;
    this.drawRoad();

    const fall = this.speed * dt * 0.85;
    this.obstacles.children.iterate((c) => {
      const o = c as Phaser.GameObjects.Rectangle;
      if (!o || !o.active) return;
      o.y += fall;
      if (Math.abs(o.y - this.player.y) < 40 && this.nearMissCooldown <= 0) {
        const dx = Math.abs(o.x - this.player.x);
        if (dx > 30 && dx < 70) {
          this.nearMissCooldown = 0.4;
          this.addStyle("near-miss", 8);
          this.showBanner("NEAR MISS!", "#f2c531");
        }
      }
    });
    this.pickups.children.iterate((c) => {
      const p = c as Phaser.GameObjects.Container;
      if (!p || !p.active) return;
      p.y += fall;
    });
    this.police.children.iterate((c) => {
      const p = c as Phaser.GameObjects.Container;
      if (!p || !p.active) return;
      p.y += fall * 0.3;
    });
    if (this.nearMissCooldown > 0) this.nearMissCooldown -= dt;

    const H = this.scale.height;
    this.obstacles.children.each((c) => {
      const o = c as Phaser.GameObjects.Rectangle;
      if (o.y > H + 100) this.obstacles.killAndHide(o);
    });
    this.pickups.children.each((c) => {
      const p = c as Phaser.GameObjects.Container;
      if (p.y > H + 100) this.pickups.killAndHide(p);
    });
    this.police.children.each((c) => {
      const p = c as Phaser.GameObjects.Container;
      if (p.y < -100 || p.y > H + 200) this.police.killAndHide(p);
    });
  }

  private drawRain(dt: number) {
    const W = this.scale.width;
    const H = this.scale.height;
    this.rainGfx.clear();
    this.rainGfx.lineStyle(2, 0xbfd4ff, 0.45);
    for (const d of this.rainDrops) {
      d.y += d.vy * dt;
      d.x -= 60 * dt;
      if (d.y > H) { d.y = -10; d.x = Math.random() * W; }
      if (d.x < 0) d.x = W;
      this.rainGfx.beginPath();
      this.rainGfx.moveTo(d.x, d.y);
      this.rainGfx.lineTo(d.x - 6, d.y + 16);
      this.rainGfx.strokePath();
    }
  }

  private spawnExhaust() {
    this.exhaustTrailTimer += 1;
    if (this.exhaustTrailTimer % 2 !== 0) return;
    const x = this.player.x + (Math.random() - 0.5) * 14;
    const y = this.player.y + 28;
    const c = this.exhaustColorHex;
    const puff = this.add.circle(x, y, 6 + Math.random() * 4, c, 0.85);
    this.tweens.add({
      targets: puff,
      alpha: 0,
      scale: 2.4,
      y: y + 40,
      duration: 380,
      onComplete: () => puff.destroy(),
    });
  }

  // ---------- Mode ----------

  private updateMode(dt: number) {
    switch (this.mode) {
      case "police-chase":
        this.chaseTime -= dt;
        if (this.chaseTime <= 0) this.finishRace("finished");
        break;
      case "delivery-rush":
        if (this.packages >= this.packagesTarget && this.distance >= this.goalDistance) {
          this.finishRace("finished");
        }
        break;
      case "street-race":
        if (this.distance >= this.goalDistance) this.finishRace("finished");
        break;
      case "freestyle-run":
        break;
    }
  }

  // ---------- Collisions ----------

  private onHitObstacle(_player: unknown, obstacle: unknown) {
    if (this.crashed || this.ended || this.playerInvuln > 0) return;
    const obj = obstacle as Phaser.GameObjects.Rectangle;
    const type = obj.getData("type") as ObstacleType;
    if (type === "pothole") {
      this.speed = Math.max(120, this.speed * 0.55);
      this.combo = 0;
      this.cameras.main.shake(120, 0.005);
      this.obstacles.killAndHide(obj);
      this.showBanner("POTHOLE!", "#e94f37");
      this.playTone(180, 0.12);
      return;
    }
    this.crashed = true;
    this.combo = 0;
    this.cameras.main.shake(360, 0.012);
    this.cameras.main.flash(180, 220, 60, 60);
    this.playCrashSound();
    this.boosting = false;
    this.playBoostLoop(false);

    if (this.mode === "delivery-rush" && this.packages > 0) {
      this.packages = Math.max(0, this.packages - 1);
      this.showBanner("PACKAGE LOST!", "#e94f37");
    }

    if (this.mode === "freestyle-run" || this.mode === "police-chase") {
      this.time.delayedCall(900, () => this.finishRace("crashed"));
    } else {
      this.time.delayedCall(900, () => {
        this.crashed = false;
        this.playerInvuln = 1.2;
        this.speed = 200;
        this.player.x = this.scale.width / 2;
        this.tweens.add({
          targets: this.player,
          alpha: { from: 0.3, to: 1 },
          duration: 120,
          yoyo: true,
          repeat: 5,
        });
      });
    }
  }

  private onPickup(_player: unknown, pickup: unknown) {
    if (this.ended) return;
    const cont = pickup as Phaser.GameObjects.Container;
    // Guard against multiple overlap callbacks for the same pickup
    // (Phaser fires overlap every frame while overlap persists).
    if (!cont.active || cont.getData("collected")) return;
    cont.setData("collected", true);
    const kind = cont.getData("kind") as string;
    const meta = PICKUP_META[kind];
    this.cashEarned += meta.cash;
    this.repEarned += meta.rep;
    if (meta.nitro) this.nitro = Math.min(1, this.nitro + meta.nitro);
    if (meta.boost) {
      this.nitro = 1;
      this.targetSpeed = this.boostMaxSpeed * 1.1;
      this.time.delayedCall(meta.boost * 1000, () => {
        this.targetSpeed = this.maxSpeed;
      });
    }
    if (kind === "jollof" && this.mode === "delivery-rush") {
      this.packages = Math.min(this.packagesTarget, this.packages + 1);
    }
    this.combo++;
    this.comboTimer = 3.5;
    this.addStyle("pickup", 3);
    this.pickups.killAndHide(cont);
    this.playPickupSound(kind);
    this.showBanner(meta.label, "#" + meta.color.toString(16).padStart(6, "0"));
    const orb = cont.list[0] as Phaser.GameObjects.Arc;
    this.burstAt(cont.x, cont.y, orb.fillColor);
  }

  private onCaughtByPolice() {
    if (this.crashed || this.ended) return;
    this.finishRace("caught");
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 220, 60, 60);
    this.playTone(110, 0.5, "sawtooth");
  }

  // ---------- Helpers ----------

  private addStyle(_kind: string, amount: number) {
    const comboMult = 1 + Math.min(this.combo, 8) * 0.15;
    this.style += amount * comboMult;
    this.repEarned += amount * 0.5 * comboMult;
  }

  private burstAt(x: number, y: number, color: number) {
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(x, y, 4, color, 1);
      const angle = (Math.PI * 2 * i) / 8;
      const dist = 30 + Math.random() * 20;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 350,
        onComplete: () => p.destroy(),
      });
    }
  }

  private showBanner(text: string, color?: string) {
    const W = this.scale.width;
    const H = this.scale.height;
    const t = this.add.text(W / 2, H * 0.32, text, {
      fontFamily: "Geist, sans-serif",
      fontSize: "48px",
      color: color ?? "#ffffff",
      fontStyle: "bold",
      stroke: "#111111",
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(90).setScale(0.6).setAlpha(0);
    this.tweens.add({
      targets: t,
      alpha: 1,
      scale: 1,
      duration: 180,
      yoyo: true,
      hold: 600,
      onComplete: () => { t.destroy(); const idx = this.banners.indexOf(t); if (idx >= 0) this.banners.splice(idx, 1); },
    });
    this.banners.push(t);
    this.cfg.onBanner(text, color);
  }

  private emitHud() {
    const score = Math.floor(this.distance + this.style + this.cashEarned / 10 + this.repEarned * 2);
    const hud: HudState = {
      distance: Math.floor(this.distance),
      speedKmh: Math.floor(this.speed * 0.36),
      nitro: this.nitro,
      score,
      style: Math.floor(this.style),
      cashEarned: Math.floor(this.cashEarned),
      repEarned: Math.floor(this.repEarned),
      packages: this.packages,
      packagesTarget: this.packagesTarget,
      goalProgress: this.mode === "street-race"
        ? Math.min(1, this.distance / this.goalDistance)
        : this.mode === "delivery-rush"
          ? Math.min(1, (this.packages / this.packagesTarget + Math.min(1, this.distance / this.goalDistance)) / 2)
          : 0,
      chaseTime: Math.max(0, Math.ceil(this.chaseTime)),
      event: this.activeEvent,
      combo: this.combo,
      countdown: this.playing ? null : Math.max(0, this.countdown),
    };
    this.cfg.onHud(hud);
  }

  // ---------- Finish ----------

  finishRace(reason: "finished" | "crashed" | "caught" | "quit") {
    if (this.ended) return;
    this.ended = true;
    this.playing = false;
    this.playBoostLoop(false);
    this.showBanner(
      reason === "finished" ? "FINISHED!" : reason === "caught" ? "BUSTED!" : "WRECKED!",
      reason === "finished" ? "#1f9d55" : "#e94f37"
    );
    const score = Math.floor(this.distance + this.style + this.cashEarned / 10 + this.repEarned * 2);
    const result: RaceResult = {
      mode: this.mode,
      finished: reason === "finished",
      distance: Math.floor(this.distance),
      score,
      style: Math.floor(this.style),
      cashEarned: Math.floor(this.cashEarned),
      repEarned: Math.floor(this.repEarned),
      durationMs: this.time.now - this.modeStartTime,
      reason,
      newHighScore: false,
      prevHighScore: 0,
      packages: this.packages,
    };
    this.time.removeAllEvents();
    this.time.delayedCall(1200, () => {
      this.cfg.onEnd(result);
    });
  }

  quit() {
    if (this.ended) return;
    this.finishRace("quit");
  }

  // ---------- Audio ----------

  private playTone(freq: number, duration = 0.15, type: OscillatorType = "square") {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    const t = this.audioCtx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private playPickupSound(kind: string) {
    const freqs: Record<string, number> = { coin: 880, suya: 660, jollof: 740, style: 990 };
    this.playTone(freqs[kind] ?? 700, 0.12);
    if (kind === "jollof" || kind === "style") this.playTone((freqs[kind] ?? 700) * 1.5, 0.16);
  }

  private playCrashSound() {
    if (!this.audioCtx) return;
    const buf = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.4, this.audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = this.audioCtx.createBufferSource();
    src.buffer = buf;
    const gain = this.audioCtx.createGain();
    gain.gain.value = 0.4;
    src.connect(gain);
    gain.connect(this.audioCtx.destination);
    src.start();
  }

  private playHorn() {
    if (!this.playing) return;
    const id = this.cfg.loadout.hornId;
    const freqs: Record<string, number[]> = {
      "horn-beep":    [440],
      "horn-blast":   [220, 220],
      "horn-afro":    [330, 415, 494],
      "horn-goat":    [180, 120, 180],
      "horn-traffic": [200, 250, 200, 250, 180],
    };
    const seq = freqs[id] ?? freqs["horn-beep"];
    seq.forEach((f, i) => {
      this.time.delayedCall(i * 110, () => this.playTone(f, 0.15, id === "horn-goat" ? "sawtooth" : "square"));
    });
  }

  private playBoostLoop(start: boolean) {
    if (!this.audioCtx) return;
    if (start && !this.boostLoop) {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 90;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.05, this.audioCtx.currentTime + 0.1);
      this.boostLoop = { osc, gain };
    } else if (!start && this.boostLoop) {
      const { osc, gain } = this.boostLoop;
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.2);
      osc.stop(this.audioCtx.currentTime + 0.22);
      this.boostLoop = null;
    }
  }

  shutdown() {
    this.playBoostLoop(false);
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch { /* ignore */ }
      this.audioCtx = null;
    }
    this.time.removeAllEvents();
    this.tweens.killAll();
  }
}

// Suppress unused-import warnings for getItem (kept for potential future lookups).
void getItem;

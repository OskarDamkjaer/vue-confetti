import ParticleManager from './particle-manager';
import Canvas from './canvas';

/**
 * A class to drawing confetti onto a canvas.
 */
export default class Confetti {
  /**
   * Initialise.
   */
  constructor() {
    this.setDefaults();
  }

  /**
   * Initialize default.
   */
  setDefaults() {
    this.killed = false;
    this.framesSinceDrop = 0;
    this.canvas = null;
    this.canvasId = null;
    this.W = 0;
    this.H = 0;
    this.particleManager = null;
    this.particlesPerFrame = 0; // max particles dropped per frame
    this.wind = 0;
    this.windSpeed = 1;
    this.windSpeedMax = 1;
    this.windChange = 0.01;
    this.windPosCoef = 0.002;
    this.animationId = null;
  }

  getParticleOptions(opts) {
    const options = {
      canvas: this.canvas,
      W: this.W,
      H: this.H,
      wind: this.wind,
      windPosCoef: this.windPosCoef,
      windSpeedMax: this.windSpeedMax,
      count: 0,
    };

    Object.assign(options, opts);

    return options;
  }

  /**
   * Create the confetti particles.
   * @param {Object} opts
   *   The particle options.
   */
  createParticles(opts = {}) {
    const particleOpts = this.getParticleOptions(opts);
    this.particleManager = new ParticleManager(particleOpts);
  }

  /**
   * Start dropping confetti.
   * @param {Object} opts
   *   The particle options.
   */
  start(opts) {
    if (!this.canvas || opts.canvasId !== this.canvasId) {
      this.canvas = new Canvas(opts.canvasId);
      this.canvasId = opts.canvasId;
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId); // Cancel any previous loop
    }

    this.createParticles(opts);
    this.canvas.updateDimensions();
    this.setParticlesPerFrame(opts);
    this.animationId = requestAnimationFrame(this.mainLoop.bind(this));
  }

  /**
   * Set the number of particles dropped per frame.
   */
  setParticlesPerFrame(opts) {
    this.particlesPerFrame = opts.particlesPerFrame || 2;
  }

  /**
   * Stop dropping confetti.
   */
  stop() {
    this.killed = true;
    this.particlesPerFrame = 0;
  }

  /**
   * Update the confetti options.
   */
  update(opts) {
    if (this.canvas && opts.canvasId !== this.canvasId) {
      this.stop();
      this.canvas.clear();
      this.start(opts);
    }

    this.setParticlesPerFrame(opts);

    if (this.particleManager) {
      this.particleManager.particleOptions = this.getParticleOptions(opts);
      this.particleManager.refresh();
    }
  }

  /**
   * Remove confetti.
   */
  remove() {
    this.stop();
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.canvas.clear();
    this.setDefaults();
  }

  /**
   * Run the main animation loop.
   */
  mainLoop(time) {
    this.canvas.updateDimensions();
    this.canvas.clear();

    this.windSpeed = Math.sin(time / 8000) * this.windSpeedMax;
    this.wind = this.particleManager.particleOptions.wind += this.windChange; // eslint-disable-line

    let numberToAdd = this.framesSinceDrop * this.particlesPerFrame;

    while (numberToAdd >= 1) {
      this.particleManager.add();
      numberToAdd -= 1;
      this.framesSinceDrop = 0;
    }

    this.particleManager.update();
    this.particleManager.draw();

    // Stop calling if no particles left in view (i.e. it's been stopped)
    if (!this.killed || this.particleManager.items.length) {
      this.animationId = requestAnimationFrame(this.mainLoop.bind(this));
    }

    this.framesSinceDrop += 1;
  }
}

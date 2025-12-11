/**
 * Object Pool System for Performance Optimization
 * Manages reusable objects to reduce garbage collection and improve performance
 */

// Generic object pool interface
interface PoolableObject {
  reset(): void;
  isInUse(): boolean;
  setInUse(inUse: boolean): void;
}

// Generic object pool class
export class ObjectPool<T extends PoolableObject> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;
  private currentSize: number = 0;

  constructor(
    createFn: () => T,
    initialSize: number = 10,
    maxSize: number = 100,
    resetFn?: (obj: T) => void
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      const obj = this.createFn();
      obj.setInUse(false);
      this.pool.push(obj);
      this.currentSize++;
    }
  }

  // Get an object from the pool
  acquire(): T {
    // Try to find an unused object in the pool
    for (let i = 0; i < this.pool.length; i++) {
      const obj = this.pool[i];
      if (!obj.isInUse()) {
        obj.setInUse(true);
        return obj;
      }
    }

    // If no unused object found and we haven't reached max size, create new one
    if (this.currentSize < this.maxSize) {
      const obj = this.createFn();
      obj.setInUse(true);
      this.pool.push(obj);
      this.currentSize++;
      return obj;
    }

    // If pool is full, force create a new object (fallback)
    console.warn('Object pool exhausted, creating new object');
    const obj = this.createFn();
    obj.setInUse(true);
    return obj;
  }

  // Return an object to the pool
  release(obj: T): void {
    if (!obj.isInUse()) {
      console.warn('Attempting to release object that is not in use');
      return;
    }

    // Reset the object
    obj.reset();
    if (this.resetFn) {
      this.resetFn(obj);
    }
    obj.setInUse(false);
  }

  // Get pool statistics
  getStats(): {
    totalSize: number;
    inUse: number;
    available: number;
    utilization: number;
  } {
    const inUse = this.pool.filter(obj => obj.isInUse()).length;
    const available = this.pool.length - inUse;
    
    return {
      totalSize: this.pool.length,
      inUse,
      available,
      utilization: this.pool.length > 0 ? (inUse / this.pool.length) * 100 : 0
    };
  }

  // Clear the pool
  clear(): void {
    this.pool.forEach(obj => {
      if (obj.isInUse()) {
        obj.setInUse(false);
      }
    });
    this.pool = [];
    this.currentSize = 0;
  }
}

// Clay Ball object for pooling
export class PoolableClayBall implements PoolableObject {
  private inUse: boolean = false;
  public x: number = 0;
  public y: number = 0;
  public radius: number = 20;
  public color: string = '#8b5cf6';
  public categoryId: string = '';
  public opacity: number = 1;
  public scale: number = 1;

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.radius = 20;
    this.color = '#8b5cf6';
    this.categoryId = '';
    this.opacity = 1;
    this.scale = 1;
  }

  isInUse(): boolean {
    return this.inUse;
  }

  setInUse(inUse: boolean): void {
    this.inUse = inUse;
  }

  // Initialize with specific properties
  initialize(x: number, y: number, radius: number, color: string, categoryId: string): void {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.categoryId = categoryId;
    this.opacity = 1;
    this.scale = 1;
  }
}

// Particle object for celebration effects
export class PoolableParticle implements PoolableObject {
  private inUse: boolean = false;
  public x: number = 0;
  public y: number = 0;
  public vx: number = 0;
  public vy: number = 0;
  public life: number = 1;
  public maxLife: number = 1;
  public size: number = 4;
  public color: string = '#ffffff';
  public type: 'confetti' | 'spark' | 'bubble' = 'confetti';

  reset(): void {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 1;
    this.maxLife = 1;
    this.size = 4;
    this.color = '#ffffff';
    this.type = 'confetti';
  }

  isInUse(): boolean {
    return this.inUse;
  }

  setInUse(inUse: boolean): void {
    this.inUse = inUse;
  }

  // Initialize particle with properties
  initialize(
    x: number, 
    y: number, 
    vx: number, 
    vy: number, 
    life: number, 
    size: number, 
    color: string,
    type: 'confetti' | 'spark' | 'bubble' = 'confetti'
  ): void {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.color = color;
    this.type = type;
  }

  // Update particle physics
  update(deltaTime: number): void {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.vy += 0.5 * deltaTime; // Gravity
    this.life -= deltaTime;
  }

  // Check if particle is alive
  isAlive(): boolean {
    return this.life > 0;
  }

  // Get opacity based on life
  getOpacity(): number {
    return Math.max(0, this.life / this.maxLife);
  }
}

// Animation frame object for pooling
export class PoolableAnimationFrame implements PoolableObject {
  private inUse: boolean = false;
  public startTime: number = 0;
  public duration: number = 0;
  public progress: number = 0;
  public easing: (t: number) => number = (t) => t;
  public onUpdate?: (progress: number) => void;
  public onComplete?: () => void;

  reset(): void {
    this.startTime = 0;
    this.duration = 0;
    this.progress = 0;
    this.easing = (t) => t;
    this.onUpdate = undefined;
    this.onComplete = undefined;
  }

  isInUse(): boolean {
    return this.inUse;
  }

  setInUse(inUse: boolean): void {
    this.inUse = inUse;
  }

  // Initialize animation frame
  initialize(
    duration: number,
    easing: (t: number) => number = (t) => t,
    onUpdate?: (progress: number) => void,
    onComplete?: () => void
  ): void {
    this.startTime = performance.now();
    this.duration = duration;
    this.progress = 0;
    this.easing = easing;
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  // Update animation
  update(currentTime: number): boolean {
    const elapsed = currentTime - this.startTime;
    this.progress = Math.min(1, elapsed / this.duration);
    
    const easedProgress = this.easing(this.progress);
    
    if (this.onUpdate) {
      this.onUpdate(easedProgress);
    }

    if (this.progress >= 1) {
      if (this.onComplete) {
        this.onComplete();
      }
      return true; // Animation complete
    }

    return false; // Animation continuing
  }
}

// Pool manager for all object pools
export class PoolManager {
  private static instance: PoolManager;
  private clayBallPool: ObjectPool<PoolableClayBall>;
  private particlePool: ObjectPool<PoolableParticle>;
  private animationFramePool: ObjectPool<PoolableAnimationFrame>;

  private constructor() {
    // Initialize pools
    this.clayBallPool = new ObjectPool(
      () => new PoolableClayBall(),
      20, // Initial size
      100 // Max size
    );

    this.particlePool = new ObjectPool(
      () => new PoolableParticle(),
      50, // Initial size
      500 // Max size
    );

    this.animationFramePool = new ObjectPool(
      () => new PoolableAnimationFrame(),
      10, // Initial size
      50 // Max size
    );
  }

  static getInstance(): PoolManager {
    if (!PoolManager.instance) {
      PoolManager.instance = new PoolManager();
    }
    return PoolManager.instance;
  }

  // Clay ball pool methods
  acquireClayBall(): PoolableClayBall {
    return this.clayBallPool.acquire();
  }

  releaseClayBall(ball: PoolableClayBall): void {
    this.clayBallPool.release(ball);
  }

  // Particle pool methods
  acquireParticle(): PoolableParticle {
    return this.particlePool.acquire();
  }

  releaseParticle(particle: PoolableParticle): void {
    this.particlePool.release(particle);
  }

  // Animation frame pool methods
  acquireAnimationFrame(): PoolableAnimationFrame {
    return this.animationFramePool.acquire();
  }

  releaseAnimationFrame(frame: PoolableAnimationFrame): void {
    this.animationFramePool.release(frame);
  }

  // Get all pool statistics
  getAllStats(): {
    clayBalls: ReturnType<ObjectPool<PoolableClayBall>['getStats']>;
    particles: ReturnType<ObjectPool<PoolableParticle>['getStats']>;
    animationFrames: ReturnType<ObjectPool<PoolableAnimationFrame>['getStats']>;
  } {
    return {
      clayBalls: this.clayBallPool.getStats(),
      particles: this.particlePool.getStats(),
      animationFrames: this.animationFramePool.getStats()
    };
  }

  // Clear all pools
  clearAll(): void {
    this.clayBallPool.clear();
    this.particlePool.clear();
    this.animationFramePool.clear();
  }
}

// Export singleton instance
export const poolManager = PoolManager.getInstance();

export default {
  ObjectPool,
  PoolableClayBall,
  PoolableParticle,
  PoolableAnimationFrame,
  PoolManager,
  poolManager
};
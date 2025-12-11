/**
 * Achievement Jar Progress Visualization - Physics Engine
 * Matter.js integration with CSS fallback for physics-based ball simulation
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ClayBallProps, PhysicsBody, PerformanceMetrics } from './types.js';
import { 
  createPhysicsBody, 
  generateStackedPositions, 
  checkCollisions, 
  calculateJarBounds,
  PerformanceMonitor,
  validatePhysicsBody
} from './physics-utils.js';

// Matter.js types and imports (with fallback)
let Matter: any = null;
let Engine: any = null;
let World: any = null;
let Bodies: any = null;
let Body: any = null;
let Render: any = null;
let Runner: any = null;

// Try to import Matter.js, fallback to null if not available
try {
  const MatterModule = require('matter-js');
  Matter = MatterModule.default || MatterModule;
  Engine = Matter.Engine;
  World = Matter.World;
  Bodies = Matter.Bodies;
  Body = Matter.Body;
  Render = Matter.Render;
  Runner = Matter.Runner;
} catch (error) {
  console.warn('Matter.js not available, using CSS fallback');
}

interface PhysicsEngineProps {
  balls: ClayBallProps[];
  containerWidth: number;
  containerHeight: number;
  onPositionsUpdate: (positions: { [ballId: string]: { x: number; y: number } }) => void;
  onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
  enablePhysics?: boolean;
  className?: string;
}

export const PhysicsEngine: React.FC<PhysicsEngineProps> = ({
  balls,
  containerWidth,
  containerHeight,
  onPositionsUpdate,
  onPerformanceUpdate,
  enablePhysics = true,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<any>(null);
  const renderRef = useRef<any>(null);
  const runnerRef = useRef<any>(null);
  const bodiesRef = useRef<{ [ballId: string]: any }>({});
  const performanceMonitorRef = useRef(new PerformanceMonitor());
  
  const [physicsEnabled, setPhysicsEnabled] = useState(enablePhysics && Matter !== null);
  const [positions, setPositions] = useState<{ [ballId: string]: { x: number; y: number } }>({});

  // Calculate jar bounds
  const jarBounds = useMemo(() => 
    calculateJarBounds(containerWidth, containerHeight), 
    [containerWidth, containerHeight]
  );

  // Initialize Matter.js engine
  const initializePhysicsEngine = useCallback(() => {
    if (!Matter || !canvasRef.current) return null;

    try {
      // Create engine with optimized settings
      const engine = Engine.create();
      engine.world.gravity.y = 0.8; // Slightly reduced gravity for softer feel
      
      // Performance optimizations
      engine.timing.timeScale = 1;
      engine.velocityIterations = 4; // Reduced from default 4 for better performance
      engine.positionIterations = 6; // Reduced from default 6 for better performance
      engine.constraintIterations = 2; // Reduced from default 2
      engine.enableSleeping = true; // Enable sleeping for better performance
      
      // Create renderer (hidden, just for physics calculation)
      const render = Render.create({
        canvas: canvasRef.current,
        engine: engine,
        options: {
          width: containerWidth,
          height: containerHeight,
          wireframes: false,
          background: 'transparent',
          showVelocity: false,
          showAngleIndicator: false,
          showDebug: false,
          pixelRatio: 1 // Force pixel ratio to 1 for better performance
        }
      });

      // Create jar boundaries (invisible walls) with curved bottom
      const wallThickness = 10;
      const jarBottom = Bodies.rectangle(
        jarBounds.centerX, 
        jarBounds.bottomY + wallThickness/2, 
        jarBounds.width, 
        wallThickness, 
        { 
          isStatic: true, 
          render: { visible: false },
          friction: 0.8, // Higher friction for more stable stacking
          restitution: 0.3 // Lower bounce for softer landings
        }
      );
      
      const jarLeftWall = Bodies.rectangle(
        jarBounds.centerX - jarBounds.width/2 - wallThickness/2, 
        jarBounds.bottomY - jarBounds.height/2, 
        wallThickness, 
        jarBounds.height, 
        { 
          isStatic: true, 
          render: { visible: false },
          friction: 0.6,
          restitution: 0.2
        }
      );
      
      const jarRightWall = Bodies.rectangle(
        jarBounds.centerX + jarBounds.width/2 + wallThickness/2, 
        jarBounds.bottomY - jarBounds.height/2, 
        wallThickness, 
        jarBounds.height, 
        { 
          isStatic: true, 
          render: { visible: false },
          friction: 0.6,
          restitution: 0.2
        }
      );

      World.add(engine.world, [jarBottom, jarLeftWall, jarRightWall]);

      // Create runner with optimized timing
      const runner = Runner.create({
        delta: 16.666, // Target 60fps
        isFixed: true
      });
      
      return { engine, render, runner };
    } catch (error) {
      console.error('Failed to initialize physics engine:', error);
      return null;
    }
  }, [containerWidth, containerHeight, jarBounds]);

  // Add balls to physics world
  const addBallsToPhysics = useCallback((ballsToAdd: ClayBallProps[]) => {
    if (!engineRef.current || !Matter) return;

    // Remove existing bodies
    Object.values(bodiesRef.current).forEach(body => {
      if (body) {
        World.remove(engineRef.current.world, body);
      }
    });
    bodiesRef.current = {};

    // Sort balls by priority and size for better stacking
    const sortedBalls = [...ballsToAdd].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === 'high' ? -1 : 1; // High priority first
      }
      return b.size - a.size; // Larger balls first within same priority
    });

    // Add new bodies with enhanced physics properties
    sortedBalls.forEach((ball, index) => {
      const physicsBody = createPhysicsBody(ball, jarBounds);
      const validatedBody = validatePhysicsBody(physicsBody, jarBounds);
      
      try {
        const matterBody = Bodies.circle(
          validatedBody.x,
          validatedBody.y,
          validatedBody.radius,
          {
            mass: validatedBody.mass,
            restitution: validatedBody.restitution || (ball.isSpecial ? 0.7 : 0.5),
            friction: validatedBody.friction || 0.4,
            frictionAir: 0.01, // Air resistance for more realistic movement
            density: ball.priority === 'high' ? 0.002 : 0.001, // Higher density for priority balls
            render: { visible: false }, // We'll render with React components
            sleepThreshold: 60, // Allow balls to sleep when stable
            label: `ball-${ball.id}` // For debugging
          }
        );

        // Add slight delay for staggered dropping effect with priority consideration
        const dropDelay = ball.priority === 'high' ? index * 80 : index * 120;
        setTimeout(() => {
          if (engineRef.current) {
            World.add(engineRef.current.world, matterBody);
            bodiesRef.current[ball.id] = matterBody;
          }
        }, dropDelay);
      } catch (error) {
        console.error('Failed to add ball to physics world:', error);
      }
    });
  }, [jarBounds]);

  // Update positions from physics simulation
  const updatePositionsFromPhysics = useCallback(() => {
    if (!engineRef.current || !Matter) return;

    const newPositions: { [ballId: string]: { x: number; y: number } } = {};
    
    Object.entries(bodiesRef.current).forEach(([ballId, body]) => {
      if (body && body.position) {
        newPositions[ballId] = {
          x: body.position.x,
          y: body.position.y
        };
      }
    });

    setPositions(newPositions);
    onPositionsUpdate(newPositions);
  }, [onPositionsUpdate]);

  // CSS fallback positioning
  const updatePositionsWithCSS = useCallback(() => {
    const stackedPositions = generateStackedPositions(balls, jarBounds);
    const collisionFreePositions = checkCollisions(stackedPositions, balls);
    
    setPositions(collisionFreePositions);
    onPositionsUpdate(collisionFreePositions);
  }, [balls, jarBounds, onPositionsUpdate]);

  // Performance monitoring with enhanced metrics
  const monitorPerformance = useCallback(() => {
    const metrics = performanceMonitorRef.current.update();
    metrics.ballCount = balls.length;
    metrics.physicsEnabled = physicsEnabled;
    
    // Add additional performance metrics
    if (engineRef.current && Matter) {
      const world = engineRef.current.world;
      metrics.bodyCount = world.bodies.length;
      metrics.constraintCount = world.constraints.length;
      metrics.sleepingBodies = world.bodies.filter((body: any) => body.isSleeping).length;
    }
    
    onPerformanceUpdate?.(metrics);
    
    // Enhanced auto-degradation logic
    if (physicsEnabled && performanceMonitorRef.current.shouldDegrade(metrics)) {
      console.warn('Physics performance degraded, switching to CSS fallback', {
        fps: metrics.fps,
        memoryUsage: metrics.memoryUsage,
        ballCount: metrics.ballCount
      });
      setPhysicsEnabled(false);
    }
    
    // Auto-recovery if performance improves and we're in CSS mode
    if (!physicsEnabled && Matter && metrics.fps > 45 && metrics.memoryUsage < 50 && balls.length < 20) {
      console.info('Performance improved, re-enabling physics');
      setPhysicsEnabled(true);
    }
  }, [balls.length, physicsEnabled, onPerformanceUpdate]);

  // Initialize physics engine
  useEffect(() => {
    if (physicsEnabled && Matter) {
      const physicsSystem = initializePhysicsEngine();
      
      if (physicsSystem) {
        engineRef.current = physicsSystem.engine;
        renderRef.current = physicsSystem.render;
        runnerRef.current = physicsSystem.runner;
        
        // Start the engine
        Runner.run(physicsSystem.runner, physicsSystem.engine);
        
        // Set up position update loop
        const updateLoop = setInterval(() => {
          updatePositionsFromPhysics();
          monitorPerformance();
        }, 16); // ~60fps
        
        return () => {
          clearInterval(updateLoop);
          if (physicsSystem.runner) Runner.stop(physicsSystem.runner);
          if (physicsSystem.render) Render.stop(physicsSystem.render);
          if (physicsSystem.engine) Engine.clear(physicsSystem.engine);
        };
      } else {
        setPhysicsEnabled(false);
      }
    }
  }, [physicsEnabled, initializePhysicsEngine, updatePositionsFromPhysics, monitorPerformance]);

  // Add balls to physics world when balls change
  useEffect(() => {
    if (physicsEnabled && engineRef.current) {
      addBallsToPhysics(balls);
    }
  }, [balls, physicsEnabled, addBallsToPhysics]);

  // CSS fallback when physics is disabled
  useEffect(() => {
    if (!physicsEnabled) {
      updatePositionsWithCSS();
    }
  }, [physicsEnabled, updatePositionsWithCSS]);

  // Handle container resize
  useEffect(() => {
    if (renderRef.current && canvasRef.current) {
      renderRef.current.canvas.width = containerWidth;
      renderRef.current.canvas.height = containerHeight;
      renderRef.current.options.width = containerWidth;
      renderRef.current.options.height = containerHeight;
    }
  }, [containerWidth, containerHeight]);

  return (
    <div className={`physics-engine relative ${className}`}>
      {/* Hidden canvas for Matter.js (only used for physics calculation) */}
      {physicsEnabled && (
        <canvas
          ref={canvasRef}
          width={containerWidth}
          height={containerHeight}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            opacity: 0,
            zIndex: -1
          }}
        />
      )}
      
      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 text-xs text-slate-500 bg-white/80 rounded px-2 py-1">
          Physics: {physicsEnabled ? 'Matter.js' : 'CSS Fallback'} | Balls: {balls.length}
        </div>
      )}
    </div>
  );
};

/**
 * Hook for managing physics engine state
 */
export const usePhysicsEngine = (
  balls: ClayBallProps[],
  containerWidth: number,
  containerHeight: number,
  enablePhysics: boolean = true
) => {
  const [positions, setPositions] = useState<{ [ballId: string]: { x: number; y: number } }>({});
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    ballCount: 0,
    renderTime: 0,
    physicsEnabled: enablePhysics
  });

  const handlePositionsUpdate = useCallback((newPositions: { [ballId: string]: { x: number; y: number } }) => {
    setPositions(newPositions);
  }, []);

  const handlePerformanceUpdate = useCallback((metrics: PerformanceMetrics) => {
    setPerformance(metrics);
  }, []);

  return {
    positions,
    performance,
    handlePositionsUpdate,
    handlePerformanceUpdate
  };
};
'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Github, Code2, GitBranch, Shield, Loader2 } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { RepolyxLogo } from '@/components/brand/RepolyxLogo';
import { env } from '@/lib/env';

declare global {
    interface Window {
        UnicornStudio?: { init?: () => void; isInitialized?: boolean };
    }
}

function useIsVisible(threshold = 0.15) {
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        observerRef.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) entry.target.classList.add('in-view');
            });
        }, { root: null, rootMargin: '0px', threshold });

        const els = document.querySelectorAll('.reveal-on-scroll, .kinetic-heading');
        els.forEach((el) => observerRef.current?.observe(el));

        return () => observerRef.current?.disconnect();
    }, [threshold]);
}

function IntelligenceAtmosphere() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        // --- STARS (MINIMAL GALAXY WITH ROTATION) ---
        interface Star {
            x: number;
            y: number;
            size: number;
            color: string;
            twinkleSpeed: number;
            phase: number;
            brightness: number;
        }

        const stars: Star[] = [];
        const colors = [
            'rgba(255, 255, 255, ', // White star
            'rgba(147, 197, 253, ', // Soft sky-blue (sky-300)
            'rgba(103, 232, 249, ', // Glowing cyan (cyan-300)
        ];

        // Generate ~110 starlights for a premium rich space feeling
        const starCount = 110;
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.3 + 0.3, // Size 0.3px to 1.6px
                color: colors[Math.floor(Math.random() * colors.length)],
                twinkleSpeed: 0.015 + Math.random() * 0.045,
                phase: Math.random() * Math.PI * 2,
                brightness: Math.random() > 0.7 ? 0.6 + Math.random() * 0.4 : 0.15 + Math.random() * 0.45,
            });
        }

        // --- SLOW FLOATING PARTICLES (COSMIC DUST) ---
        interface DustParticle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
            phase: number;
            speed: number;
        }

        const dusts: DustParticle[] = Array.from({ length: 18 }).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.15,
            vy: -0.05 - Math.random() * 0.1, // Drifts slowly upwards
            size: 3 + Math.random() * 5, // Soft circles sizes 3px to 8px
            opacity: 0.01 + Math.random() * 0.03, // Ultra faint
            phase: Math.random() * Math.PI * 2,
            speed: 0.005 + Math.random() * 0.01
        }));

        // --- TOPOLOGY NETWORK NODES ---
        interface NetworkNode {
            id: string;
            relX: number;
            relY: number;
            x: number;
            y: number;
            label: string;
            pulsePhase: number;
            pulseSpeed: number;
            size: number;
        }

        const nodeDefs = [
            { id: '1', relX: 0.08, relY: 0.22, label: 'ast.ts' },
            { id: '2', relX: 0.06, relY: 0.58, label: 'parser.go' },
            { id: '3', relX: 0.20, relY: 0.36, label: 'scanner.rs' },
            { id: '4', relX: 0.12, relY: 0.82, label: 'schema.sql' },
            
            // Center area slots (behind/under hero content)
            { id: '5', relX: 0.48, relY: 0.14, label: 'analysis.rs' },
            { id: '6', relX: 0.42, relY: 0.88, label: 'vector.db' },
            
            // Right-side empty slots
            { id: '7', relX: 0.92, relY: 0.26, label: 'indexer.go' },
            { id: '8', relX: 0.80, relY: 0.46, label: 'auth.ts' },
            { id: '9', relX: 0.94, relY: 0.70, label: 'api.rs' },
            { id: '10', relX: 0.82, relY: 0.86, label: 'main.py' }
        ];

        const nodes: NetworkNode[] = nodeDefs.map(def => ({
            id: def.id,
            relX: def.relX,
            relY: def.relY,
            x: def.relX * width,
            y: def.relY * height,
            label: def.label,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.015 + Math.random() * 0.02,
            size: 2 + Math.random() * 1.5
        }));

        const connections = [
            [0, 2], [1, 2], [2, 4], [1, 3], [3, 5],
            [4, 6], [4, 7], [7, 6], [7, 8], [8, 9], [6, 9]
        ];

        // --- SIGNALS (AI ACTIVE PACKETS FLOWING) ---
        interface Signal {
            connectionIndex: number;
            progress: number;
            speed: number;
            reverse: boolean;
        }

        const signals: Signal[] = Array.from({ length: 6 }).map(() => ({
            connectionIndex: Math.floor(Math.random() * connections.length),
            progress: Math.random(),
            speed: 0.002 + Math.random() * 0.004, // Extremely slow, premium crawling
            reverse: Math.random() > 0.5
        }));

        // Galaxy cosmic rotation angle
        let rotationAngle = 0;

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            
            nodes.forEach(node => {
                node.x = node.relX * width;
                node.y = node.relY * height;
            });

            stars.forEach(star => {
                star.x = Math.random() * width;
                star.y = Math.random() * height;
            });
        };

        window.addEventListener('resize', handleResize);

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            const centerX = width / 2;
            const centerY = height / 2;

            // Increment rotation extremely slowly to animate a breathing galaxy drift
            rotationAngle += 0.00004;
            const cos = Math.cos(rotationAngle);
            const sin = Math.sin(rotationAngle);

            // 1. Draw Soft Blue Ambient Cosmic Nebulas
            const pulseGlow1 = Math.sin(Date.now() * 0.0004) * 35;
            const pulseGlow2 = Math.cos(Date.now() * 0.0003) * 45;

            const grad1 = ctx.createRadialGradient(
                width * 0.35, height * 0.3, 10,
                width * 0.35, height * 0.3, 460 + pulseGlow1
            );
            grad1.addColorStop(0, 'rgba(2, 132, 199, 0.06)'); // Sky-blue soft core
            grad1.addColorStop(0.5, 'rgba(6, 182, 212, 0.015)'); // Cyan ambient haze
            grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad1;
            ctx.fillRect(0, 0, width, height);

            const grad2 = ctx.createRadialGradient(
                width * 0.75, height * 0.55, 10,
                width * 0.75, height * 0.55, 520 + pulseGlow2
            );
            grad2.addColorStop(0, 'rgba(29, 78, 216, 0.04)'); // Soft deep blue
            grad2.addColorStop(0.5, 'rgba(147, 197, 253, 0.01)'); // Soft light blue blur
            grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad2;
            ctx.fillRect(0, 0, width, height);

            // 2. Draw Twinkling Starfield with Cosmic Rotation
            stars.forEach((star) => {
                star.phase += star.twinkleSpeed;
                const sinVal = Math.sin(star.phase);
                const pulse = Math.pow((sinVal + 1) / 2, 2.5);
                let opacity = 0.01 + pulse * star.brightness;
                
                if (Math.random() > 0.94) {
                    opacity *= 0.15 + Math.random() * 0.85;
                }

                // Apply dynamic galaxy rotation coordinates
                const rx = cos * (star.x - centerX) - sin * (star.y - centerY) + centerX;
                const ry = sin * (star.x - centerX) + cos * (star.y - centerY) + centerY;

                ctx.beginPath();
                ctx.arc(rx, ry, star.size, 0, Math.PI * 2);
                ctx.fillStyle = star.color + opacity + ')';
                ctx.fill();

                if (star.size > 1.2 && opacity > 0.35) {
                    ctx.beginPath();
                    ctx.arc(rx, ry, star.size * 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = star.color + (opacity * 0.15) + ')';
                    ctx.fill();
                }
            });

            // 3. Draw Slow Floating Cosmic Dust Particles
            dusts.forEach((dust) => {
                dust.phase += dust.speed;
                // Soft sinus wave side wobble
                dust.x += dust.vx + Math.sin(dust.phase) * 0.04;
                dust.y += dust.vy;

                // Screen boundaries wrapping
                if (dust.y < -20) {
                    dust.y = height + 20;
                    dust.x = Math.random() * width;
                }
                if (dust.x < -20 || dust.x > width + 20) {
                    dust.x = Math.random() * width;
                }

                ctx.beginPath();
                ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
                const breathingOpacity = dust.opacity * (0.4 + Math.sin(dust.phase) * 0.3);
                ctx.fillStyle = `rgba(147, 197, 253, ${breathingOpacity})`;
                ctx.fill();
            });

            // 4. Draw Faint Graph Connections (Neural breathing Activation)
            connections.forEach(([i, j]) => {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                ctx.beginPath();
                ctx.moveTo(nodeA.x, nodeA.y);
                ctx.lineTo(nodeB.x, nodeB.y);
                
                // Opacity pulses organically based on synapse endpoints
                const neuralOpacity = 0.01 + Math.pow((Math.sin(nodeA.pulsePhase + nodeB.pulsePhase) + 1) / 2, 2) * 0.045;
                ctx.strokeStyle = `rgba(6, 182, 212, ${neuralOpacity})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            // 5. Draw Repository Nodes
            nodes.forEach((node) => {
                node.pulsePhase += node.pulseSpeed;
                const scale = 1 + Math.sin(node.pulsePhase) * 0.22;
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size * 2 * scale, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.02)';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = '#22d3ee';
                ctx.fill();

                ctx.fillStyle = 'rgba(163, 163, 163, 0.18)';
                ctx.font = '9px ui-monospace, SFMono-Regular, Consolas, monospace';
                ctx.textAlign = 'center';
                ctx.fillText(node.label, node.x, node.y - node.size - 6);
            });

            // 6. Draw Flowing Signal Packets with Glowing Trails
            signals.forEach((sig) => {
                const conn = connections[sig.connectionIndex];
                const nodeA = nodes[conn[0]];
                const nodeB = nodes[conn[1]];

                const from = sig.reverse ? nodeB : nodeA;
                const to = sig.reverse ? nodeA : nodeB;

                const curX = from.x + (to.x - from.x) * sig.progress;
                const curY = from.y + (to.y - from.y) * sig.progress;

                sig.progress += sig.speed;
                if (sig.progress >= 1) {
                    sig.progress = 0;
                    sig.connectionIndex = Math.floor(Math.random() * connections.length);
                    sig.reverse = Math.random() > 0.5;
                    sig.speed = 0.002 + Math.random() * 0.004;
                }

                // Vector math to draw trail
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len > 0) {
                    const trailLength = Math.min(35, len * sig.progress);
                    const trailX = curX - (dx / len) * trailLength;
                    const trailY = curY - (dy / len) * trailLength;

                    const trailGrad = ctx.createLinearGradient(curX, curY, trailX, trailY);
                    trailGrad.addColorStop(0, 'rgba(34, 211, 238, 0.45)');
                    trailGrad.addColorStop(1, 'rgba(34, 211, 238, 0)');

                    ctx.beginPath();
                    ctx.moveTo(curX, curY);
                    ctx.lineTo(trailX, trailY);
                    ctx.strokeStyle = trailGrad;
                    ctx.lineWidth = 1.8;
                    ctx.stroke();
                }

                // Draw glowing signal node head
                ctx.beginPath();
                ctx.arc(curX, curY, 1.8, 0, Math.PI * 2);
                ctx.shadowColor = '#22d3ee';
                ctx.shadowBlur = 6;
                ctx.fillStyle = 'rgba(34, 211, 238, 0.85)';
                ctx.fill();
                
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none -z-20 opacity-80 mix-blend-screen will-change-transform"
        />
    );
}

export default function LandingPage() {
    function SwipeGitHubButton() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const x = useMotionValue(0);
    const [dragWidth, setDragWidth] = useState(196); // Calculated sliding limit

    useEffect(() => {
        if (containerRef.current) {
            const track = containerRef.current;
            const newDragWidth = track.clientWidth - 40 - 8; // track width - thumb width - padding
            setDragWidth(newDragWidth > 0 ? newDragWidth : 196);
        }
    }, []);

    const opacity = useTransform(x, [0, dragWidth], [1, 0]);
    const fillScaleX = useTransform(x, [0, dragWidth], [0, 1]);

    const handleDragEnd = () => {
        const currentX = x.get();
        if (currentX >= dragWidth * 0.85) {
            animate(x, dragWidth, { type: 'spring', stiffness: 400, damping: 28 });
            setIsProcessing(true);
            
            setTimeout(() => {
                setIsProcessing(false);
                setIsSuccess(true);
                setTimeout(() => {
                    window.location.href = `${env.NEXT_PUBLIC_API_URL}/api/auth/github`;
                }, 400);
            }, 1200);
        } else {
            animate(x, 0, { type: 'spring', stiffness: 350, damping: 25 });
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-[280px] h-[48px] bg-[#07090e]/95 border border-white/10 hover:border-white/15 rounded-xl flex items-center select-none p-1 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] overflow-hidden group"
        >
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes swipeBlink {
                    0% { opacity: 0.15; }
                    50% { opacity: 1; }
                    100% { opacity: 0.15; }
                }
            ` }} />
            
            {/* Active Track Fill */}
            <motion.div
                style={{ scaleX: fillScaleX, originX: 0 }}
                className="absolute inset-y-1 left-1 right-1 bg-gradient-to-r from-cyan-500/10 via-cyan-500/20 to-cyan-500/30 rounded-lg pointer-events-none"
            />

            {/* Glowing hover state */}
            <div className="absolute inset-0 pointer-events-none rounded-xl border border-transparent group-hover:border-cyan-500/10 transition-all duration-300" />

            {/* Instruction Text */}
            <motion.div
                style={{ opacity }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none pl-11 pr-3 text-center"
            >
                <span className="font-orbitron text-[9px] tracking-[0.25em] text-neutral-400 font-semibold uppercase flex items-center gap-1">
                    SLIDE TO LOGIN
                    <span className="flex text-cyan-400 font-extrabold gap-0.5 tracking-normal ml-0.5">
                        <span className="inline-block animate-[swipeBlink_1.4s_infinite_both]" style={{ animationDelay: '0s' }}>&gt;</span>
                        <span className="inline-block animate-[swipeBlink_1.4s_infinite_both_0.2s]" style={{ animationDelay: '0.2s' }}>&gt;</span>
                        <span className="inline-block animate-[swipeBlink_1.4s_infinite_both_0.4s]" style={{ animationDelay: '0.4s' }}>&gt;</span>
                    </span>
                </span>
            </motion.div>

            {/* Slider Handle Drag Thumb */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: dragWidth }}
                dragElastic={0.02}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className={`relative z-10 h-[38px] w-[38px] rounded-lg flex items-center justify-center transition-colors shrink-0 cursor-grab active:cursor-grabbing ${
                    isSuccess
                        ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : isProcessing
                        ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                        : 'bg-white hover:bg-cyan-200 text-neutral-950 shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_6px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                }`}
            >
                {isSuccess ? (
                    <span className="font-bold text-xs">✓</span>
                ) : isProcessing ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Github size={15} />
                )}
            </motion.div>
        </div>
    );
}

useIsVisible();

    useEffect(() => {
        /* Scroll progress */
        const progress = document.getElementById('scroll-progress');
        const onScroll = () => {
            if (!progress) return;
            const scrollPx = document.documentElement.scrollTop;
            const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            progress.style.transform = 'scaleX(' + (max ? scrollPx / max : 0) + ')';
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        /* Magnetic cards — RAF-throttled */
        let rafId: number | null = null;
        const cards = document.querySelectorAll('.magnetic-card');
        const onMove = (e: Event) => {
            const me = e as MouseEvent;
            const el = e.currentTarget as HTMLElement;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const rect = el.getBoundingClientRect();
                el.style.transform = 'translate3d(' +
                    ((me.clientX - rect.left - rect.width / 2) * 0.03) + 'px,' +
                    ((me.clientY - rect.top - rect.height / 2) * 0.03) + 'px,0)';
            });
        };
        const onLeave = (e: Event) => {
            if (rafId) cancelAnimationFrame(rafId);
            (e.currentTarget as HTMLElement).style.transform = 'translate3d(0,0,0)';
        };
        cards.forEach((card) => {
            card.addEventListener('mousemove', onMove, { passive: true });
            card.addEventListener('mouseleave', onLeave, { passive: true });
        });

        /* UnicornStudio WebGL background (SynqorAI template) */
        if (typeof window !== 'undefined') {
            const runInit = () => {
                setTimeout(() => {
                    const u = (window as any).UnicornStudio;
                    if (u && typeof u.init === 'function') {
                        try {
                            u.init();
                            (window as any).UnicornStudio.isInitialized = true;
                            console.log('UnicornStudio WebGL initialized successfully.');
                        } catch (err) {
                            console.error('Failed to init UnicornStudio:', err);
                        }
                    }
                }, 200); // 200ms delay to guarantee full React DOM hydration and paint
            };

            const existingScript = document.querySelector('script[src*="unicornStudio"]');
            if (existingScript) {
                if ((window as any).UnicornStudio && (window as any).UnicornStudio.init) {
                    runInit();
                } else {
                    existingScript.addEventListener('load', runInit);
                }
            } else {
                (window as any).UnicornStudio = { isInitialized: false };
                const s = document.createElement('script');
                s.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js';
                s.onload = runInit;
                (document.head || document.body).appendChild(s);
            }
        }

        return () => {
            window.removeEventListener('scroll', onScroll);
            cards.forEach((card) => {
                card.removeEventListener('mousemove', onMove as any);
                card.removeEventListener('mouseleave', onLeave as any);
            });
        };
    }, []);

    return (
        <>
            <IntelligenceAtmosphere />
            {/* ── UnicornStudio WebGL Background (SynqorAI) ── */}
            <div className="aura-background-component fixed top-0 w-full h-screen -z-10 saturate-50 blur-md brightness-75 mix-blend-screen opacity-30 pointer-events-none will-change-transform"
                data-alpha-mask="80"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
                }}>
                <div className="aura-background-component top-0 w-full h-screen -z-10 absolute saturate-150 will-change-transform"
                    data-alpha-mask="80"
                    style={{
                        maskImage: 'linear-gradient(transparent, black 0%, black 80%, transparent)',
                        WebkitMaskImage: 'linear-gradient(transparent, black 0%, black 80%, transparent)',
                    }}>
                    <div data-us-project="vi5SxDwDvEJMwkyTdyH8" className="absolute top-0 left-0 -z-10 w-full h-full" />
                </div>
            </div>

            <div id="scroll-progress" className="fixed top-0 left-0 h-[2px] w-full z-[70] bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 pointer-events-none will-change-transform" />
            <div className="fixed inset-0 vertical-streaks pointer-events-none z-0" />
            <div className="fixed inset-0 crt-scanlines pointer-events-none z-0 opacity-30" />
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_rgba(22,78,99,0.05),rgba(0,0,0,0.95),rgb(0,0,0))] pointer-events-none z-0" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 z-50 w-full bg-black/70 backdrop-blur-md border-b border-white/5">
                <div className="md:px-10 lg:px-16 flex md:h-20 h-16 w-full items-center px-6">
                    <div className="flex items-center gap-3">
                        <RepolyxLogo />
                    </div>
                    <div className="ml-auto flex items-center gap-4 md:gap-8">
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#product" className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500 hover:text-cyan-400 transition-colors duration-300">Product</a>
                            <a href="#capabilities" className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500 hover:text-cyan-400 transition-colors duration-300">Capabilities</a>
                            <a href="#workflow" className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500 hover:text-cyan-400 transition-colors duration-300">Workflow</a>
                        </div>
                        <a href="#cta" className="font-orbitron text-xs uppercase tracking-[0.2em] border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 px-5 py-2.5 md:py-3 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all duration-300 relative group overflow-hidden">
                            <div className="absolute inset-0 w-full h-full bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0 will-change-transform" />
                            <span className="relative z-10">Access Repolyx</span>
                        </a>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="z-10 w-full relative pt-16 md:pt-20">

                {/* ═══════════════════════════════════════════════════
                    HERO
                    ═══════════════════════════════════════════════════ */}
                <section id="home" className="relative w-full min-h-[90vh] overflow-hidden flex items-center border-b border-white/5">

                    {/* ── Background ── */}
                    <div className="absolute inset-0 bg-transparent" />

                    {/* Highly-tailored motion styles for hardware-accelerated background animations */}
                    <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes gridDrift {
                            from { background-position: 0 0; }
                            to { background-position: 64px 64px; }
                        }
                        @keyframes scanSweep {
                            0% { transform: translateY(-10%); opacity: 0; }
                            10% { opacity: 0.12; }
                            90% { opacity: 0.12; }
                            100% { transform: translateY(110vh); opacity: 0; }
                        }
                        .animate-grid-drift {
                            animation: gridDrift 45s linear infinite;
                        }
                        .animate-scan-sweep {
                            animation: scanSweep 20s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                        }
                        @keyframes ambientLabel {
                            0%, 100% { opacity: 0; transform: translateY(6px); }
                            12%, 82% { opacity: 0.35; transform: translateY(0); }
                        }
                        @keyframes signalPulse {
                            0%, 100% { opacity: 0.15; box-shadow: 0 0 2px 0px rgba(34,211,238,0.08); }
                            50% { opacity: 0.6; box-shadow: 0 0 8px 3px rgba(34,211,238,0.25); }
                        }
                        @keyframes nodePulse {
                            0%, 100% { opacity: 0.3; }
                            50% { opacity: 0.8; }
                        }
                        .animate-ambient-label {
                            animation: ambientLabel 14s ease-in-out infinite;
                        }
                        .animate-signal-1 {
                            animation: signalPulse 8s ease-in-out infinite;
                        }
                        .animate-signal-2 {
                            animation: signalPulse 10s ease-in-out infinite;
                            animation-delay: 3s;
                        }
                        .animate-node-pulse {
                            animation: nodePulse 4s ease-in-out infinite;
                        }
                        @keyframes starTwinkle {
                            0%, 100% { opacity: 0.05; }
                            50% { opacity: 0.8; }
                        }
                        .animate-star-twinkle {
                            animation: starTwinkle 3s ease-in-out infinite;
                        }
                        @keyframes bgStar {
                            0%, 100% { opacity: 0.04; }
                            40% { opacity: 0.8; }
                        }
                        @keyframes bgStarSlow {
                            0%, 100% { opacity: 0.03; }
                            50% { opacity: 0.55; }
                        }
                        @keyframes bgStarFast {
                            0%, 100% { opacity: 0.05; }
                            30% { opacity: 0.9; }
                        }
                        .animate-bg-star {
                            animation: bgStar 4s ease-in-out infinite;
                        }
                        .animate-bg-star-slow {
                            animation: bgStarSlow 7s ease-in-out infinite;
                        }
                        .animate-bg-star-fast {
                            animation: bgStarFast 2.5s ease-in-out infinite;
                        }
                    `}} />

                    {/* Grid with Drift */}
                    <div className="absolute inset-0 will-change-transform animate-grid-drift" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                        backgroundSize: '64px 64px'
                    }} />

                    {/* Subtle Scanning Beam Sweep */}
                    <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent pointer-events-none animate-scan-sweep will-change-transform z-0" />

                    {/* Ambient glows — 3 total */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] animate-glow-pulse-soft will-change-transform" />
                        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full bg-blue-500/4 blur-[150px] animate-glow-pulse will-change-transform" style={{ animationDelay: '-1.5s' }} />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-transparent via-cyan-500/3 to-transparent blur-[80px]" />
                    </div>

                    {/* ── Background Starfield ── */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                        <svg className="w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid meet">

                            <circle cx="35" cy="40" r="3" fill="rgba(255,255,255,0.7)" className="animate-bg-star-fast" />
                            <circle cx="120" cy="28" r="2" fill="rgba(147,197,253,0.5)" className="animate-bg-star" style={{ animationDelay: '0.4s' }} />
                            <circle cx="200" cy="55" r="2.5" fill="rgba(34,211,238,0.6)" className="animate-bg-star-slow" style={{ animationDelay: '0.8s' }} />
                            <circle cx="260" cy="30" r="1.5" fill="rgba(255,255,255,0.4)" className="animate-bg-star-fast" style={{ animationDelay: '1.2s' }} />
                            <circle cx="330" cy="65" r="3" fill="rgba(255,255,255,0.7)" className="animate-bg-star" style={{ animationDelay: '1.6s' }} />
                            <circle cx="400" cy="35" r="2" fill="rgba(147,197,253,0.5)" className="animate-bg-star-slow" style={{ animationDelay: '2s' }} />
                            <circle cx="460" cy="50" r="2.5" fill="rgba(34,211,238,0.6)" className="animate-bg-star-fast" style={{ animationDelay: '2.4s' }} />
                            <circle cx="370" cy="20" r="1.5" fill="rgba(255,255,255,0.4)" className="animate-bg-star" style={{ animationDelay: '0.6s' }} />

                            <circle cx="560" cy="40" r="2.5" fill="rgba(255,255,255,0.6)" className="animate-bg-star-slow" style={{ animationDelay: '0.3s' }} />
                            <circle cx="640" cy="25" r="2" fill="rgba(34,211,238,0.5)" className="animate-bg-star-fast" style={{ animationDelay: '0.7s' }} />
                            <circle cx="720" cy="55" r="3" fill="rgba(147,197,253,0.6)" className="animate-bg-star" style={{ animationDelay: '1.1s' }} />
                            <circle cx="680" cy="30" r="1.5" fill="rgba(255,255,255,0.4)" className="animate-bg-star-slow" style={{ animationDelay: '1.5s' }} />
                            <circle cx="760" cy="40" r="2" fill="rgba(255,255,255,0.5)" className="animate-bg-star-fast" style={{ animationDelay: '1.9s' }} />
                            <circle cx="580" cy="60" r="2" fill="rgba(34,211,238,0.5)" className="animate-bg-star" style={{ animationDelay: '2.3s' }} />

                            <circle cx="850" cy="30" r="2.5" fill="rgba(255,255,255,0.7)" className="animate-bg-star-fast" style={{ animationDelay: '0.2s' }} />
                            <circle cx="920" cy="55" r="2" fill="rgba(147,197,253,0.5)" className="animate-bg-star-slow" style={{ animationDelay: '0.6s' }} />
                            <circle cx="1000" cy="25" r="3" fill="rgba(34,211,238,0.6)" className="animate-bg-star" style={{ animationDelay: '1s' }} />
                            <circle cx="1080" cy="60" r="1.5" fill="rgba(255,255,255,0.4)" className="animate-bg-star-fast" style={{ animationDelay: '1.4s' }} />
                            <circle cx="1150" cy="35" r="2.5" fill="rgba(255,255,255,0.6)" className="animate-bg-star-slow" style={{ animationDelay: '1.8s' }} />
                            <circle cx="1250" cy="50" r="2" fill="rgba(147,197,253,0.5)" className="animate-bg-star" style={{ animationDelay: '2.2s' }} />
                            <circle cx="1330" cy="25" r="3" fill="rgba(34,211,238,0.6)" className="animate-bg-star-fast" style={{ animationDelay: '0.1s' }} />
                            <circle cx="1400" cy="55" r="2" fill="rgba(255,255,255,0.5)" className="animate-bg-star-slow" style={{ animationDelay: '0.5s' }} />

                            <circle cx="35" cy="750" r="2" fill="rgba(34,211,238,0.5)" className="animate-bg-star" style={{ animationDelay: '0.5s' }} />
                            <circle cx="120" cy="820" r="2.5" fill="rgba(255,255,255,0.6)" className="animate-bg-star-fast" style={{ animationDelay: '0.9s' }} />
                            <circle cx="200" cy="740" r="2" fill="rgba(147,197,253,0.5)" className="animate-bg-star-slow" style={{ animationDelay: '1.3s' }} />
                            <circle cx="260" cy="810" r="3" fill="rgba(255,255,255,0.7)" className="animate-bg-star" style={{ animationDelay: '1.7s' }} />
                            <circle cx="330" cy="750" r="1.5" fill="rgba(34,211,238,0.4)" className="animate-bg-star-fast" style={{ animationDelay: '2.1s' }} />
                            <circle cx="400" cy="820" r="2.5" fill="rgba(255,255,255,0.6)" className="animate-bg-star-slow" style={{ animationDelay: '2.5s' }} />
                            <circle cx="450" cy="740" r="2" fill="rgba(147,197,253,0.5)" className="animate-bg-star" style={{ animationDelay: '0.1s' }} />
                            <circle cx="270" cy="850" r="2" fill="rgba(255,255,255,0.5)" className="animate-bg-star-fast" style={{ animationDelay: '0.7s' }} />

                            <circle cx="550" cy="750" r="2.5" fill="rgba(255,255,255,0.6)" className="animate-bg-star-slow" style={{ animationDelay: '0.2s' }} />
                            <circle cx="620" cy="820" r="2" fill="rgba(34,211,238,0.5)" className="animate-bg-star-fast" style={{ animationDelay: '0.6s' }} />
                            <circle cx="700" cy="740" r="3" fill="rgba(147,197,253,0.6)" className="animate-bg-star" style={{ animationDelay: '1s' }} />
                            <circle cx="660" cy="810" r="1.5" fill="rgba(255,255,255,0.4)" className="animate-bg-star-slow" style={{ animationDelay: '1.4s' }} />
                            <circle cx="750" cy="750" r="2" fill="rgba(255,255,255,0.5)" className="animate-bg-star-fast" style={{ animationDelay: '1.8s' }} />
                            <circle cx="580" cy="850" r="2.5" fill="rgba(34,211,238,0.5)" className="animate-bg-star" style={{ animationDelay: '2.2s' }} />

                            <circle cx="850" cy="750" r="2" fill="rgba(255,255,255,0.6)" className="animate-bg-star-fast" style={{ animationDelay: '0.3s' }} />
                            <circle cx="920" cy="820" r="2.5" fill="rgba(147,197,253,0.5)" className="animate-bg-star-slow" style={{ animationDelay: '0.7s' }} />
                            <circle cx="1000" cy="740" r="3" fill="rgba(34,211,238,0.6)" className="animate-bg-star" style={{ animationDelay: '1.1s' }} />
                            <circle cx="1080" cy="810" r="1.5" fill="rgba(255,255,255,0.4)" className="animate-bg-star-fast" style={{ animationDelay: '1.5s' }} />
                            <circle cx="1150" cy="750" r="2.5" fill="rgba(255,255,255,0.6)" className="animate-bg-star-slow" style={{ animationDelay: '1.9s' }} />
                            <circle cx="1250" cy="820" r="2" fill="rgba(147,197,253,0.5)" className="animate-bg-star" style={{ animationDelay: '2.3s' }} />
                            <circle cx="1330" cy="740" r="3" fill="rgba(34,211,238,0.6)" className="animate-bg-star-fast" />
                            <circle cx="1400" cy="810" r="2" fill="rgba(255,255,255,0.5)" className="animate-bg-star-slow" style={{ animationDelay: '0.4s' }} />

                            <circle cx="25" cy="220" r="2" fill="rgba(255,255,255,0.5)" className="animate-bg-star-fast" style={{ animationDelay: '0.2s' }} />
                            <circle cx="40" cy="300" r="2.5" fill="rgba(147,197,253,0.5)" className="animate-bg-star-slow" style={{ animationDelay: '0.8s' }} />
                            <circle cx="20" cy="380" r="1.5" fill="rgba(34,211,238,0.4)" className="animate-bg-star" style={{ animationDelay: '1.4s' }} />
                            <circle cx="45" cy="460" r="3" fill="rgba(255,255,255,0.6)" className="animate-bg-star-fast" style={{ animationDelay: '2s' }} />
                            <circle cx="30" cy="540" r="2" fill="rgba(255,255,255,0.5)" className="animate-bg-star-slow" style={{ animationDelay: '0.4s' }} />
                            <circle cx="50" cy="620" r="2.5" fill="rgba(147,197,253,0.5)" className="animate-bg-star" style={{ animationDelay: '1s' }} />

                            <circle cx="495" cy="220" r="2.5" fill="rgba(255,255,255,0.6)" className="animate-bg-star-slow" style={{ animationDelay: '0.6s' }} />
                            <circle cx="505" cy="320" r="2" fill="rgba(34,211,238,0.5)" className="animate-bg-star" style={{ animationDelay: '1.2s' }} />
                            <circle cx="490" cy="420" r="3" fill="rgba(255,255,255,0.7)" className="animate-bg-star-fast" style={{ animationDelay: '1.8s' }} />
                            <circle cx="510" cy="520" r="1.5" fill="rgba(147,197,253,0.4)" className="animate-bg-star-slow" style={{ animationDelay: '2.4s' }} />
                            <circle cx="500" cy="620" r="2.5" fill="rgba(34,211,238,0.6)" className="animate-bg-star" style={{ animationDelay: '0.3s' }} />

                            <circle cx="180" cy="180" r="4" fill="rgba(255,255,255,0.8)" className="animate-bg-star" style={{ animationDelay: '0.5s' }} />
                            <circle cx="720" cy="180" r="4" fill="rgba(34,211,238,0.7)" className="animate-bg-star-slow" style={{ animationDelay: '1s' }} />
                            <circle cx="1080" cy="180" r="4" fill="rgba(147,197,253,0.7)" className="animate-bg-star-fast" style={{ animationDelay: '1.5s' }} />
                            <circle cx="360" cy="720" r="4" fill="rgba(255,255,255,0.8)" className="animate-bg-star" style={{ animationDelay: '2s' }} />
                            <circle cx="1260" cy="720" r="4" fill="rgba(34,211,238,0.7)" className="animate-bg-star-slow" />

                        </svg>
                    </div>

                    {/* ── Content ── */}
                    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

                        {/* LEFT */}
                        <div className="w-full lg:w-7/12 pt-12 lg:pt-0 animate-hero-rise will-change-transform">

                            <div className="inline-flex items-center gap-2 border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 mb-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                <span className="text-[11px] font-orbitron uppercase tracking-[0.35em] text-cyan-400">Repository Intelligence</span>
                            </div>

                            <h1 className="font-orbitron text-white uppercase leading-[1.05] tracking-tight">
                                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl block kinetic-heading in-view will-change-transform">
                                    Understand Your
                                </span>
                                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-100 to-white/80 kinetic-heading in-view will-change-transform" style={{ animationDelay: '0.15s' }}>
                                    GitHub Repository
                                </span>
                                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl block mt-2 kinetic-heading in-view will-change-transform" style={{ animationDelay: '0.3s' }}>
                                    with AI.
                                </span>
                            </h1>

                            <p className="mt-6 text-sm md:text-base text-neutral-400 font-light leading-relaxed max-w-lg border-l border-cyan-500/30 pl-4 py-1 kinetic-heading in-view will-change-transform" style={{ animationDelay: '0.45s' }}>
                                Connect any GitHub repository. Repolyx scans your codebase, maps architecture, reviews pull requests, and generates documentation — all through a single AI-native workspace.
                            </p>

                            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3 sm:gap-4 kinetic-heading in-view" style={{ animationDelay: '0.6s' }}>
                                <SwipeGitHubButton />

                                <a href="#product"
                                    className="group relative inline-flex items-center gap-3 border border-white/10 bg-transparent text-white font-orbitron font-normal text-xs uppercase tracking-[0.2em] px-6 py-3.5 transition-all duration-300 hover:border-white/30 hover:bg-white/5"
                                >
                                    <span>See how it works</span>
                                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                                </a>
                            </div>

                            <div className="mt-6 flex items-center gap-4 text-[11px] text-neutral-600 font-mono kinetic-heading in-view" style={{ animationDelay: '0.75s' }}>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
                                    GitHub OAuth
                                </span>
                                <span className="w-3 h-[1px] bg-neutral-800" />
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/70" />
                                    SOC 2 Compliant
                                </span>
                            </div>
                        </div>

                        {/* RIGHT: Ambient Repository Topology */}
                        <div className="w-full lg:w-5/12 relative flex items-center justify-center py-12 lg:py-0">
                            <div className="relative w-full max-w-[420px] aspect-[4/3]">

                                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.1) 0%, transparent 60%)' }} />

                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 420 320" preserveAspectRatio="xMidYMid meet">

                                    <path d="M 50 160 L 140 50 L 240 160 L 340 50 L 405 160" stroke="rgba(34,211,238,0.15)" strokeWidth="0.5" fill="none" />
                                    <path d="M 50 160 L 140 270 L 240 160 L 340 270 L 405 160" stroke="rgba(34,211,238,0.15)" strokeWidth="0.5" fill="none" />
                                    <path d="M 140 50 L 340 50" stroke="rgba(34,211,238,0.08)" strokeWidth="0.5" fill="none" strokeDasharray="3 4" />
                                    <path d="M 140 270 L 340 270" stroke="rgba(34,211,238,0.08)" strokeWidth="0.5" fill="none" strokeDasharray="3 4" />
                                    <path d="M 50 160 L 15 120" stroke="rgba(34,211,238,0.07)" strokeWidth="0.5" fill="none" />
                                    <path d="M 50 160 L 15 200" stroke="rgba(34,211,238,0.07)" strokeWidth="0.5" fill="none" />

                                    <circle cx="50" cy="160" r="2.5" fill="rgba(34,211,238,0.3)" />
                                    <circle cx="140" cy="50" r="2" fill="rgba(34,211,238,0.2)" />
                                    <circle cx="140" cy="270" r="2" fill="rgba(34,211,238,0.2)" />
                                    <circle cx="240" cy="160" r="3" fill="rgba(34,211,238,0.35)" className="animate-node-pulse" />
                                    <circle cx="340" cy="50" r="2" fill="rgba(34,211,238,0.2)" />
                                    <circle cx="340" cy="270" r="2" fill="rgba(34,211,238,0.2)" />
                                    <circle cx="405" cy="160" r="1.8" fill="rgba(34,211,238,0.18)" />

                                    <text x="50" y="178" textAnchor="middle" fill="rgba(148,163,184,0.3)" fontSize="7" fontFamily="monospace">main</text>
                                    <text x="140" y="42" textAnchor="middle" fill="rgba(148,163,184,0.2)" fontSize="7" fontFamily="monospace">src/</text>
                                    <text x="140" y="285" textAnchor="middle" fill="rgba(148,163,184,0.2)" fontSize="7" fontFamily="monospace">packages/</text>
                                    <text x="240" y="178" textAnchor="middle" fill="rgba(148,163,184,0.35)" fontSize="7" fontFamily="monospace">analysis</text>
                                    <text x="340" y="42" textAnchor="middle" fill="rgba(148,163,184,0.2)" fontSize="7" fontFamily="monospace">scanner.rs</text>
                                    <text x="340" y="285" textAnchor="middle" fill="rgba(148,163,184,0.2)" fontSize="7" fontFamily="monospace">indexer.go</text>
                                    <text x="405" y="178" textAnchor="middle" fill="rgba(148,163,184,0.18)" fontSize="7" fontFamily="monospace">export</text>

                                    <circle cx="30" cy="25" r="1.5" fill="rgba(255,255,255,0.4)" className="animate-star-twinkle" />
                                    <circle cx="100" cy="15" r="1" fill="rgba(147,197,253,0.35)" className="animate-star-twinkle" style={{ animationDelay: '0.4s' }} />
                                    <circle cx="190" cy="20" r="1.2" fill="rgba(34,211,238,0.3)" className="animate-star-twinkle" style={{ animationDelay: '0.8s' }} />
                                    <circle cx="310" cy="15" r="1" fill="rgba(255,255,255,0.35)" className="animate-star-twinkle" style={{ animationDelay: '1.2s' }} />
                                    <circle cx="395" cy="30" r="1.5" fill="rgba(147,197,253,0.4)" className="animate-star-twinkle" style={{ animationDelay: '1.6s' }} />
                                    <circle cx="50" cy="295" r="1" fill="rgba(34,211,238,0.3)" className="animate-star-twinkle" style={{ animationDelay: '0.2s' }} />
                                    <circle cx="100" cy="310" r="1.2" fill="rgba(255,255,255,0.35)" className="animate-star-twinkle" style={{ animationDelay: '0.6s' }} />
                                    <circle cx="200" cy="305" r="1" fill="rgba(147,197,253,0.35)" className="animate-star-twinkle" style={{ animationDelay: '1s' }} />
                                    <circle cx="320" cy="295" r="1.5" fill="rgba(34,211,238,0.3)" className="animate-star-twinkle" style={{ animationDelay: '1.4s' }} />
                                    <circle cx="395" cy="310" r="1" fill="rgba(255,255,255,0.35)" className="animate-star-twinkle" style={{ animationDelay: '1.8s' }} />
                                    <circle cx="290" cy="105" r="1" fill="rgba(147,197,253,0.3)" className="animate-star-twinkle" style={{ animationDelay: '0.3s' }} />
                                    <circle cx="370" cy="90" r="1.2" fill="rgba(34,211,238,0.3)" className="animate-star-twinkle" style={{ animationDelay: '0.7s' }} />
                                    <circle cx="160" cy="110" r="1" fill="rgba(255,255,255,0.35)" className="animate-star-twinkle" style={{ animationDelay: '1.1s' }} />
                                    <circle cx="250" cy="210" r="1.2" fill="rgba(147,197,253,0.3)" className="animate-star-twinkle" style={{ animationDelay: '1.5s' }} />
                                    <circle cx="370" cy="200" r="1" fill="rgba(34,211,238,0.3)" className="animate-star-twinkle" style={{ animationDelay: '1.9s' }} />

                                </svg>

                                <div className="absolute w-[3px] h-[3px] rounded-full bg-cyan-400 shadow-[0_0_6px_2px_rgba(34,211,238,0.35)] animate-signal-1" style={{ left: 'calc(57.1% - 1.5px)', top: 'calc(50% - 1.5px)' }} />
                                <div className="absolute w-[3px] h-[3px] rounded-full bg-cyan-400 shadow-[0_0_8px_3px_rgba(34,211,238,0.4)] animate-signal-2" style={{ left: 'calc(11.9% - 1.5px)', top: 'calc(50% - 1.5px)' }} />

                                <div className="absolute top-[10%] right-[5%] animate-ambient-label">
                                    <span className="text-[9px] font-mono text-cyan-500/40 tracking-wide">analyzing source tree</span>
                                </div>
                                <div className="absolute bottom-[16%] left-[3%] animate-ambient-label" style={{ animationDelay: '4s' }}>
                                    <span className="text-[9px] font-mono text-cyan-500/30 tracking-wide">mapping 1,284 files</span>
                                </div>
                                <div className="absolute top-[52%] right-[2%] animate-ambient-label" style={{ animationDelay: '8s' }}>
                                    <span className="text-[9px] font-mono text-cyan-500/20 tracking-wide">dependencies resolved</span>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/[0.03] bg-black/30">
                        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 h-10 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-600">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-cyan-500/60" />
                                    SYSTEM ONLINE
                                </span>
                                <span className="text-neutral-800 hidden sm:inline">·</span>
                                <span className="hidden sm:inline">AI CORE v2.4</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                                <span className="w-1 h-1 rounded-full bg-emerald-500/60" />
                                <span>LIVE</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Product Preview ── */}
                <section id="product" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 w-full border-b border-white/5 bg-transparent relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 reveal-on-scroll" style={{ '--reveal-delay': '0ms' } as React.CSSProperties}>
                            <div>
                                <p className="font-orbitron text-xs uppercase tracking-[0.4em] text-cyan-500 mb-3 flex items-center gap-3">
                                    <span className="w-6 md:w-8 h-[1px] bg-cyan-500" /> 01 // Product
                                </p>
                                <h2 className="text-2xl md:text-4xl font-normal tracking-tight text-white font-orbitron uppercase">Repository Intelligence Dashboard</h2>
                            </div>
                            <p className="text-neutral-500 text-xs font-orbitron tracking-[0.2em] uppercase max-w-xs text-right">
                                One unified interface for your entire GitHub ecosystem.
                            </p>
                        </div>

                        <div className="border border-white/10 bg-[#0a0a0a] w-full overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] reveal-on-scroll" style={{ '--reveal-delay': '90ms' } as React.CSSProperties}>
                            <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden"><div className="h-full w-1/3 bg-cyan-400 animate-scan" /></div>
                            <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-[#0a0a0a]">
                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-white/10" />
                                        <span className="font-light">Repolyx</span>
                                    </div>
                                    <span className="text-neutral-700">/</span>
                                    <span className="font-light">Dashboard</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-cyan-400 border border-cyan-500/20 px-2 py-1 font-mono">STATUS: NOMINAL</span>
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row">
                                <aside className="w-full lg:w-56 border-r border-white/10 bg-[#0a0a0a] p-4 space-y-6 shrink-0">
                                    <div className="space-y-3">
                                        <p className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500">Repositories</p>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 border border-white/10 text-xs text-white">
                                                <Github size={14} className="text-cyan-400" />
                                                repolyx/cli
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-400 hover:bg-white/5 transition-colors cursor-pointer">
                                                <Github size={14} />
                                                repolyx/core
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-neutral-400 hover:bg-white/5 transition-colors cursor-pointer">
                                                <Github size={14} />
                                                repolyx/ui
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500">Scan Status</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="w-2 h-2 bg-cyan-400" />
                                            <span className="text-neutral-300">Indexing active</span>
                                        </div>
                                        <div className="h-1 bg-white/5 overflow-hidden">
                                            <div className="h-full w-[78%] bg-cyan-400" />
                                        </div>
                                    </div>
                                </aside>
                                <main className="flex-1 p-4 md:p-6 space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Connected Repos', value: '24' },
                                            { label: 'Files Indexed', value: '12.4K' },
                                            { label: 'AI Analyses', value: '187' },
                                            { label: 'Open PRs', value: '8' },
                                        ].map((m, i) => (
                                            <div key={i} className="border border-white/10 bg-black/40 p-3 text-center">
                                                <p className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500">{m.label}</p>
                                                <p className="text-lg md:text-xl font-orbitron text-cyan-400 mt-1">{m.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-white/10 bg-black/40 p-4">
                                            <p className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500 mb-3">Latest Intelligence</p>
                                            <div className="space-y-3 text-xs text-neutral-400">
                                                <div className="bg-black/40 border border-white/10 p-3">
                                                    <p className="text-white font-medium mb-1">Architecture anti-patterns detected</p>
                                                    <p>4 circular dependencies found in <span className="text-cyan-400">repolyx/core</span></p>
                                                </div>
                                                <div className="bg-black/40 border border-white/10 p-3">
                                                    <p className="text-white font-medium mb-1">PR #218 reviewed</p>
                                                    <p>Test coverage gaps flagged in <span className="text-cyan-400">src/parser.ts</span></p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border border-white/10 bg-black/40 p-4">
                                            <p className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500 mb-3">AI Recommendations</p>
                                            <div className="space-y-3 text-xs">
                                                <div className="flex items-center justify-between bg-black/40 border border-white/10 p-3">
                                                    <span className="text-neutral-300">Update axios dependency</span>
                                                    <span className="text-amber-400 font-mono">High</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-black/40 border border-white/10 p-3">
                                                    <span className="text-neutral-300">Generate API docs</span>
                                                    <span className="text-cyan-400 font-mono">Medium</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-black/40 border border-white/10 p-3">
                                                    <span className="text-neutral-300">Refactor auth middleware</span>
                                                    <span className="text-cyan-400 font-mono">Low</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border border-white/10 bg-black/40 p-3 text-xs text-neutral-400">
                                        <div className="flex items-center gap-2">
                                            <span>Last scan: <span className="text-white">2m ago</span></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-cyan-400" />
                                            <span>System nominal</span>
                                        </div>
                                    </div>
                                </main>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Core Capabilities ── */}
                <section id="capabilities" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-neutral-950/30 w-full border-b border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 reveal-on-scroll" style={{ '--reveal-delay': '0ms' } as React.CSSProperties}>
                            <div>
                                <p className="font-orbitron text-xs uppercase tracking-[0.4em] text-cyan-500 mb-3 flex items-center gap-3">
                                    <span className="w-6 md:w-8 h-[1px] bg-cyan-500" /> 02 // Capabilities
                                </p>
                                <h2 className="text-2xl md:text-4xl font-normal tracking-tight text-white font-orbitron uppercase">What Repolyx Does</h2>
                            </div>
                            <p className="text-neutral-500 text-xs font-orbitron tracking-[0.2em] uppercase max-w-xs text-right">
                                AI-powered repository intelligence.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {[
                                {
                                    icon: <Code2 size={20} />,
                                    label: 'ARCHITECTURE',
                                    title: 'Code Understanding',
                                    desc: 'AI analyzes your entire repo structure, maps dependency graphs, and surfaces architecture insights instantly.',
                                    delay: '90ms'
                                },
                                {
                                    icon: <GitBranch size={20} />,
                                    label: 'REVIEWS',
                                    title: 'Smart PR Reviews',
                                    desc: 'Automated code reviews with contextual understanding. Detects bugs, security risks, and quality issues before merge.',
                                    delay: '180ms'
                                },
                                {
                                    icon: <Shield size={20} />,
                                    label: 'INSIGHTS',
                                    title: 'Security & Quality',
                                    desc: 'Continuous monitoring for dependency drift, vulnerable packages, and architecture anti-patterns across all repos.',
                                    delay: '270ms'
                                }
                            ].map((item, i) => (
                                <div key={i} className="group relative bg-neutral-950 border border-white/10 hover:border-cyan-500/50 transition-colors duration-500 p-5 md:p-6 flex flex-col justify-between min-h-[260px] overflow-hidden reveal-on-scroll magnetic-card" style={{ '--reveal-delay': item.delay } as React.CSSProperties}>
                                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                    <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden">
                                        <div className="h-full w-1/3 bg-cyan-400 animate-scan hidden group-hover:block" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-10 h-10 border border-white/10 bg-black flex items-center justify-center text-cyan-400 transition-transform duration-500 group-hover:scale-110">
                                                {item.icon}
                                            </div>
                                            <span className="text-xs font-orbitron tracking-[0.2em] text-neutral-600 border border-white/5 px-2 py-1 uppercase">{item.label}</span>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-normal tracking-tight mb-2 text-white font-orbitron uppercase transition-colors duration-300 group-hover:text-cyan-300">{item.title}</h3>
                                        <p className="text-sm text-neutral-500 font-light leading-relaxed">{item.desc}</p>
                                    </div>
                                    <div className="relative z-10 flex items-center gap-2 text-cyan-500 text-xs font-orbitron tracking-[0.2em] uppercase mt-6 opacity-50 transition-opacity duration-300 group-hover:opacity-100">
                                        Explore <ArrowRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── AI Workflow ── */}
                <section id="workflow" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-transparent w-full border-b border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }} />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="max-w-2xl mb-12 reveal-on-scroll" style={{ '--reveal-delay': '0ms' } as React.CSSProperties}>
                            <p className="font-orbitron text-xs uppercase tracking-[0.4em] text-cyan-500 mb-3 flex items-center gap-3">
                                <span className="w-6 md:w-8 h-[1px] bg-cyan-500" /> 03 // AI Workflow
                            </p>
                            <h2 className="text-3xl md:text-5xl font-normal tracking-tight text-white font-orbitron uppercase mb-6 leading-tight">
                                How Repolyx <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white/50">Understands Your Code.</span>
                            </h2>
                            <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed border-l border-cyan-500/30 pl-4 py-1">
                                From raw repository to intelligent insights in three seamless steps. No manual configuration required.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {[
                                {
                                    step: '01', title: 'Connect & Index',
                                    desc: 'Link your GitHub repositories. Repolyx automatically scans your entire codebase — branches, history, dependencies, and structure.',
                                    accent: 'from-cyan-500/10'
                                },
                                {
                                    step: '02', title: 'AI Analysis Engine',
                                    desc: 'Our AI builds a complete map of your architecture, identifies patterns, detects anti-patterns, and understands every code path.',
                                    accent: 'from-blue-500/10'
                                },
                                {
                                    step: '03', title: 'Intelligent Actions',
                                    desc: 'Get automated PR reviews, security alerts, architecture recommendations, and instant documentation — all from repo context.',
                                    accent: 'from-cyan-400/10'
                                }
                            ].map((item, i) => (
                                <div key={i} className="group border border-white/10 bg-neutral-950/60 p-6 md:p-8 relative overflow-hidden reveal-on-scroll magnetic-card hover:border-cyan-500/40 transition-colors duration-500" style={{ '--reveal-delay': (90 + i * 90) + 'ms' } as React.CSSProperties}>
                                    <div className={'absolute inset-0 bg-gradient-to-b ' + item.accent + ' to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none'} />
                                    <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden">
                                        <div className="h-full w-1/3 bg-cyan-400 animate-scan hidden group-hover:block" />
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-4xl md:text-5xl font-orbitron text-cyan-500/30 mb-4">{item.step}</p>
                                        <h3 className="text-xl md:text-2xl font-normal tracking-tight text-white font-orbitron uppercase mb-3 transition-colors duration-300 group-hover:text-cyan-300">{item.title}</h3>
                                        <p className="text-sm text-neutral-400 font-light leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 reveal-on-scroll" style={{ '--reveal-delay': '360ms' } as React.CSSProperties}>
                            <p className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500">
                                From <span className="text-cyan-400">github.com</span> to full repository intelligence
                            </p>
                            <a href="#cta" className="inline-flex items-center gap-2 text-xs font-orbitron uppercase tracking-[0.2em] text-cyan-400 hover:text-white transition-colors duration-300">
                                Get Started <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </section>

                {/* ── CTA + Footer ── */}
                <footer id="cta" className="py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-neutral-950/30 border-t border-white/5 w-full relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="border border-white/10 bg-black p-8 md:p-12 text-center relative overflow-hidden reveal-on-scroll" style={{ '--reveal-delay': '0ms' } as React.CSSProperties}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.03),transparent_70%)] pointer-events-none" />
                            <div className="absolute top-0 left-0 w-full h-[1px] overflow-hidden">
                                <div className="h-full w-1/3 bg-cyan-400 animate-scan" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-center gap-3 mb-6">
                                    <div className="w-2 h-2 bg-cyan-500" />
                                    <span className="font-orbitron text-xs uppercase tracking-[0.3em] text-cyan-500">DEPLOY.INDEX.SHIP</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-orbitron uppercase text-white leading-tight mb-6">
                                    Ready to understand<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white/50">your repositories?</span>
                                </h2>
                                <p className="text-sm md:text-base text-neutral-400 font-light max-w-xl mx-auto mb-8">
                                    Connect your GitHub account and let AI analyze, review, and document your codebase in minutes. No setup, no configuration.
                                </p>
                                <a href={`${env.NEXT_PUBLIC_API_URL}/api/auth/github`} className="group relative inline-flex items-center gap-3 border border-cyan-400 bg-cyan-400/10 text-cyan-400 font-orbitron font-normal text-sm uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_50px_rgba(0,255,255,0.4)]">
                                    <span>Connect GitHub &nbsp;→</span>
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50 group-hover:border-black/50" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50 group-hover:border-black/50" />
                                </a>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div>
                                <RepolyxLogo className="mb-2" />
                                <p className="text-xs text-neutral-500 font-mono">AI-native engineering workspace for GitHub.</p>
                            </div>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <a href="#" className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500 hover:text-cyan-400 transition-colors duration-300">GitHub</a>
                                <a href="#" className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500 hover:text-cyan-400 transition-colors duration-300">Twitter</a>
                                <a href="#" className="text-xs font-orbitron uppercase tracking-[0.2em] text-neutral-500 hover:text-cyan-400 transition-colors duration-300">Docs</a>
                                <a href="mailto:hello@repolyx.dev" className="font-orbitron text-xs uppercase tracking-[0.2em] border border-cyan-500/30 text-cyan-400 bg-cyan-500/5 px-6 py-2.5 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all duration-300">
                                    Contact
                                </a>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                            <p className="text-xs font-mono text-neutral-600">© 2026 REPOLYX — Repository Intelligence</p>
                            <p className="text-xs font-mono text-neutral-600">SYS_STATUS: <span className="text-cyan-500">NOMINAL</span></p>
                        </div>
                    </div>
                </footer>
            </main>
        </>
    );
}

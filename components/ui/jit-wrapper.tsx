'use client';

import React, { useState, useEffect, useRef } from 'react';

interface JitWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    threshold?: number; // Intersection threshold
    delay?: number; // Auto-load delay in ms
}

/**
 * Just-In-Time (JIT) Wrapper
 * Delays rendering of heavy components until:
 * 1. User hovers/interactions (onMouseEnter, onFocus)
 * 2. Component is in viewport (InteractionObserver)
 * 3. Timeout expires (default 4000ms) - safety fallback
 * 
 * Benefits:
 * - Reduces Initial JS Bundle execution (Hydration)
 * - Prioritizes LCP content
 */
export function JitWrapper({
    children,
    fallback,
    threshold = 0,
    delay = 4000
}: JitWrapperProps) {
    const [show, setShow] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Safety timeout to ensure content eventually loads
        const timer = setTimeout(() => setShow(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (show || !ref.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShow(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [show, threshold]);

    const handleInteraction = () => {
        if (!show) setShow(true);
    };

    if (show) {
        return <>{children}</>;
    }

    return (
        <div
            ref={ref}
            onMouseEnter={handleInteraction}
            onFocus={handleInteraction}
            onTouchStart={handleInteraction}
            onClick={handleInteraction}
            className="contents" // Use contents to avoid layout shifts if possible, but fallback might need it
        >
            {fallback}
        </div>
    );
}

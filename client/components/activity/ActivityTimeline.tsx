'use client';

import { motion } from 'framer-motion';
import { ActivityEventCard } from './ActivityEventCard';
import type { ActivityEvent } from '@/lib/types';

interface ActivityTimelineProps {
    events: ActivityEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
    return (
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            <div className="space-y-4">
                {events.map((event) => (
                    <div key={event.id} className="relative">
                        <div className="absolute left-3 top-6 hidden h-full w-0.5 bg-white/10 md:block" />
                        <ActivityEventCard event={event} />
                    </div>
                ))}
            </div>
        </motion.section>
    );
}

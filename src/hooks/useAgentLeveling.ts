import { useState, useEffect } from 'react';
import type { Agent, AgentStats } from '../data/agents';

const XP_PER_LEVEL_BASE = 1000;
const STAT_MULTIPLIER = 0.05; // 5% stats increase per level

interface AgentProgress {
    xp: number;
    level: number;
}

export const useAgentLeveling = (agent: Agent) => {
    const [progress, setProgress] = useState<AgentProgress>({ xp: 0, level: 1 });

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(`agent_progress_${agent.id}`);
        if (stored) {
            setProgress(JSON.parse(stored));
        }
    }, [agent.id]);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem(`agent_progress_${agent.id}`, JSON.stringify(progress));
    }, [progress, agent.id]);

    const calculateLevel = (xp: number) => {
        // Simple linear progression: Level increases every 1000 XP
        // Level 1: 0-999
        // Level 2: 1000-1999
        return Math.floor(xp / XP_PER_LEVEL_BASE) + 1;
    };

    const addXp = (amount: number) => {
        setProgress(prev => {
            const newXp = prev.xp + amount;
            const newLevel = calculateLevel(newXp);

            // Check for level up notification logic here if needed
            if (newLevel > prev.level) {
                console.log("Level Up!");
            }

            return { xp: newXp, level: newLevel };
        });
    };

    // Calculate current Stats based on level
    const currentStats: AgentStats = {
        intelligence: Math.min(100, Math.round(agent.baseStats.intelligence * (1 + (progress.level - 1) * STAT_MULTIPLIER))),
        speed: Math.min(100, Math.round(agent.baseStats.speed * (1 + (progress.level - 1) * STAT_MULTIPLIER))),
        creativity: Math.min(100, Math.round(agent.baseStats.creativity * (1 + (progress.level - 1) * STAT_MULTIPLIER))),
    };

    // Get current Image based on level (Check evolution map)
    const getCurrentImage = () => {
        // If no evolution map, return default image
        if (!agent.evolutionMap) return agent.image;

        // Find the highest level in the map that is <= current level
        // e.g. Level 12. Map has {10: img1, 20: img2}. We want 10.
        const evolutionLevels = Object.keys(agent.evolutionMap)
            .map(Number)
            .sort((a, b) => b - a); // Descending order (20, 10)

        for (const levelKey of evolutionLevels) {
            if (progress.level >= levelKey) {
                return agent.evolutionMap[levelKey];
            }
        }

        // Default to base image if no evolution reached yet
        return agent.image;
    };

    // Calculate progress to next level
    const xpForNextLevel = progress.level * XP_PER_LEVEL_BASE; // Total XP needed for next level
    const xpForCurrentLevel = (progress.level - 1) * XP_PER_LEVEL_BASE; // XP at start of current level

    // XP within current level
    const currentLevelXp = progress.xp - xpForCurrentLevel;
    const xpNeededForNext = XP_PER_LEVEL_BASE; // Always 1000 in this linear model

    const progressToNextPercent = (currentLevelXp / xpNeededForNext) * 100;

    return {
        level: progress.level,
        xp: progress.xp,
        addXp,
        currentStats,
        currentImage: getCurrentImage(),
        progressToNextPercent,
        nextLevelXp: xpForNextLevel,
        isMaxLevel: progress.level >= 100 // Cap visual at 100 logic if needed
    };
};

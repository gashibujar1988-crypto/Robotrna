import { logSystemEvent } from './logger';

export interface MemoryFragment {
    id: string;
    agentName: string;
    content: string;
    timestamp: number;
    tags: string[];
}

const MEMORY_KEY = 'mother_shared_memory';

export const getSharedMemories = (limit: number = 10): MemoryFragment[] => {
    try {
        const memories = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');
        return memories.sort((a: MemoryFragment, b: MemoryFragment) => b.timestamp - a.timestamp).slice(0, limit);
    } catch (e) {
        return [];
    }
};

export const addSharedMemory = (agentName: string, content: string, tags: string[] = []) => {
    try {
        const memories = JSON.parse(localStorage.getItem(MEMORY_KEY) || '[]');

        // Prevent duplicates (simple check)
        const isDuplicate = memories.some((m: MemoryFragment) => m.content === content);
        if (isDuplicate) return;

        const newMemory: MemoryFragment = {
            id: Date.now().toString(),
            agentName,
            content,
            timestamp: Date.now(),
            tags
        };

        const updatedMemories = [newMemory, ...memories].slice(0, 100); // Keep last 100 insights
        localStorage.setItem(MEMORY_KEY, JSON.stringify(updatedMemories));

        // Log this sync event
        logSystemEvent(`Mother synkroniserade ny insikt från ${agentName}`, 'Mother Core');

        // Dispatch event for UI updates
        window.dispatchEvent(new Event('mother_memory_update'));
    } catch (e) {
        console.error("Failed to save memory", e);
    }
};

export const clearMemories = () => {
    localStorage.removeItem(MEMORY_KEY);
};

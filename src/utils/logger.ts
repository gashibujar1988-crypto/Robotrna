export const logSystemEvent = (message: string, agent: string = 'System') => {
    const logs = JSON.parse(localStorage.getItem('system_logs') || '[]');
    const newLog = {
        message,
        agent,
        timestamp: Date.now()
    };
    logs.push(newLog);
    // Keep only last 50 logs to prevent storage bloat
    if (logs.length > 50) logs.shift();

    localStorage.setItem('system_logs', JSON.stringify(logs));

    // Dispatch storage event so Dashboard updates in real-time within the same window
    window.dispatchEvent(new Event('storage'));
};

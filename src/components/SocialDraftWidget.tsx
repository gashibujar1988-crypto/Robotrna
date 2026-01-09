
import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Linkedin, Edit3 } from 'lucide-react';

interface Draft {
    platform: string;
    content: string;
}

interface Props {
    draft: Draft | null;
    onApprove: (content: string) => void;
    onReject: () => void;
}

const SocialDraftWidget: React.FC<Props> = ({ draft, onApprove, onReject }) => {
    if (!draft) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-2xl border-2 border-blue-500/20 mb-8 relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Linkedin className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Förhandsgranskning</h3>
                        <p className="text-xs text-blue-500 font-medium">LinkedIn Draft • Soshie</p>
                    </div>
                </div>
                <div className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    Väntar på godkännande
                </div>
            </div>

            {/* Content Preview */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700 font-sans text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {draft.content}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={onReject}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <X className="w-4 h-4" /> Kasta
                </button>
                <button
                    onClick={() => onApprove(draft.content)}
                    className="flex-[2] px-4 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-500/30"
                >
                    <Check className="w-4 h-4" /> Publicera Nu
                </button>
            </div>
        </motion.div>
    );
};

export default SocialDraftWidget;

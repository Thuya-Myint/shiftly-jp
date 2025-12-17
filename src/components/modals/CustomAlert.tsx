import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function CustomAlert({ isOpen, onConfirm, onCancel, title, message }: {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    <motion.div
                        initial={{ scale: 0.95, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 10 }}
                        transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-slate-700 gpu-accelerated"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                        <div className="flex gap-3">
                            <Button
                                onClick={onCancel}
                                variant="outline"
                                className="flex-1 h-10 rounded-xl border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                className={cn("flex-1 h-10 rounded-xl text-white font-semibold", "bg-red-500 hover:bg-red-600")}
                            >
                                Delete
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
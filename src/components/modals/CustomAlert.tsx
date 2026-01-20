
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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-500" size={24} strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 uppercase">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium leading-relaxed">{message}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={onConfirm}
            className={cn("w-full h-12 rounded-xl text-white font-bold text-base shadow-md bg-red-500 hover:bg-red-600 active:scale-[0.98]")}
          >
            CONFIRM
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 font-bold text-base active:scale-[0.98]"
          >
            CANCEL
          </Button>
        </div>
      </div>
    </div>
  );
}

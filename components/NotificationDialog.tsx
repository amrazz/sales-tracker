'use client';

import { X, CheckCircle2, AlertCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'confirm';
    onConfirm?: () => void;
}

export default function NotificationDialog({
    isOpen,
    onClose,
    title,
    message,
    type = 'success',
    onConfirm
}: NotificationDialogProps) {
    if (!isOpen) return null;

    const config = {
        success: {
            icon: CheckCircle2,
            iconClass: 'text-green-500 bg-green-50',
            btnClass: 'bg-green-600 hover:bg-green-700 shadow-green-100',
        },
        error: {
            icon: AlertCircle,
            iconClass: 'text-red-500 bg-red-50',
            btnClass: 'bg-red-600 hover:bg-red-700 shadow-red-100',
        },
        warning: {
            icon: AlertTriangle,
            iconClass: 'text-amber-500 bg-amber-50',
            btnClass: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
        },
        confirm: {
            icon: HelpCircle,
            iconClass: 'text-blue-500 bg-blue-50',
            btnClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-100',
        }
    }[type];

    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={type === 'confirm' ? undefined : onClose}
            />
            <div className="relative bg-white w-full max-w-[320px] rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in slide-in-from-bottom-8 duration-300">
                <div className={cn("w-20 h-20 rounded-4xl flex items-center justify-center mb-6", config.iconClass)}>
                    <Icon className="w-10 h-10" />
                </div>

                <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-2">{title}</h3>
                <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8">{message}</p>

                <div className="flex gap-3 w-full">
                    {type === 'confirm' && (
                        <button
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (type === 'confirm' && onConfirm) {
                                onConfirm();
                            }
                            onClose();
                        }}
                        className={cn(
                            "flex-1 h-14 rounded-2xl text-white font-black text-sm active:scale-95 transition-all shadow-lg",
                            config.btnClass
                        )}
                    >
                        {type === 'confirm' ? 'Confirm' : 'Got it'}
                    </button>
                </div>
            </div>
        </div>
    );
}

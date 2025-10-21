import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessBannerProps {
  message: string;
  onDismiss?: () => void;
}

export default function SuccessBanner({ message, onDismiss }: SuccessBannerProps) {
  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-green-400 text-sm">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
import { Download, X, Share } from 'lucide-react';
import { Button } from '../UI/Button';
import { Card } from '../UI/Card';

interface PWAInstallPromptProps {
  isIOS: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export function PWAInstallPrompt({ isIOS, onInstall, onDismiss }: PWAInstallPromptProps) {
  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-slideUp">
      <Card className="shadow-2xl border-2 border-amber-900/20">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-900 to-amber-800 rounded-xl flex items-center justify-center shadow-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Install K9 Manager
                </h3>
                <p className="text-xs text-stone-600">
                  Quick access anytime
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-stone-400 hover:text-stone-600 transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isIOS ? (
            <div className="space-y-3">
              <p className="text-sm text-stone-700 leading-relaxed">
                Install this app for faster access, offline support, and a full-screen experience.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Share className="w-4 h-4 text-amber-900 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-900">
                    <span className="font-semibold">iOS:</span> Tap the Share button, then select "Add to Home Screen"
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={onDismiss}
                fullWidth
              >
                Got it
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-stone-700 leading-relaxed">
                Get faster access, offline support, and a full-screen experience on your device.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onInstall}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onDismiss}
                >
                  Not now
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

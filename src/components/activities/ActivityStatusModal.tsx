import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

interface ActivityStatusModalProps {
  open: boolean;
  onClose: () => void;
  activity: any | null;
  status: 'completed' | 'cancelled';
  onSubmit: (activityId: string, status: 'completed' | 'cancelled', message: string) => void;
}

export function ActivityStatusModal({
  open,
  onClose,
  activity,
  status,
  onSubmit,
}: ActivityStatusModalProps) {
  const [message, setMessage] = useState('');

  if (!activity) return null;

  const isComplete = status === 'completed';

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        {/* HEADER – same as ActivityDetailsSheet */}
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            {isComplete ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {isComplete ? 'Mark Complete' : 'Cancel Activity'}
          </SheetTitle>
        </SheetHeader>

        {/* BODY – same spacing & structure */}
        <div className="space-y-6 py-4">
          {/* TITLE */}
          <div>
            <h2 className="text-lg font-semibold">{activity.title}</h2>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                {activity.description}
              </p>
            )}
          </div>

          {/* MESSAGE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isComplete ? 'Completion Note' : 'Cancellation Reason'}
            </label>
            <Textarea
              placeholder={
                isComplete ? 'Write what was done...' : 'Write why this activity was cancelled...'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            <Button
              variant={isComplete ? 'default' : 'destructive'}
              disabled={!message.trim()}
              onClick={() => {
                onSubmit(activity.id, status, message);
                setMessage('');
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

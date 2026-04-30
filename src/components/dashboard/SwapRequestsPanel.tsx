import { ArrowRightLeft, Check, X, Clock, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import type { SwapRequest } from "@/hooks/useSwapRequests";

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  approved: 'bg-success/20 text-success border-success/30',
  rejected: 'bg-destructive/20 text-destructive border-destructive/30',
};

interface SwapRequestsPanelProps {
  requests: SwapRequest[];
  isAdmin?: boolean;
  isLoading?: boolean;
  onApprove?: (id: string, notes?: string) => Promise<void>;
  onReject?: (id: string, notes?: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  reviewingId?: string;
}

export function SwapRequestsPanel({
  requests,
  isAdmin = false,
  isLoading = false,
  onApprove,
  onReject,
  onDelete,
  reviewingId,
}: SwapRequestsPanelProps) {
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          Swap Requests
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {requests.filter(r => r.status === 'pending').length} pending
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isAdmin ? "Review faculty schedule swap requests" : "Your schedule change requests"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ArrowRightLeft className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No swap requests</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{req.courseName}</p>
                      {isAdmin && (
                        <p className="text-sm text-muted-foreground">by {req.facultyName}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={STATUS_STYLES[req.status]}>
                      {req.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {req.status === 'approved' && <Check className="w-3 h-3 mr-1" />}
                      {req.status === 'rejected' && <X className="w-3 h-3 mr-1" />}
                      {req.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-destructive/5 border border-destructive/10">
                      <p className="text-xs text-muted-foreground mb-1">Current</p>
                      <p className="font-medium">{req.currentDay}</p>
                      <p className="text-muted-foreground">{req.currentStartTime} – {req.currentEndTime}</p>
                    </div>
                    <div className="p-2 rounded bg-success/5 border border-success/10">
                      <p className="text-xs text-muted-foreground mb-1">Requested</p>
                      <p className="font-medium">{req.requestedDay}</p>
                      <p className="text-muted-foreground">{req.requestedStartTime} – {req.requestedEndTime}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground italic">"{req.reason}"</p>

                  {req.adminNotes && (
                    <div className="p-2 rounded bg-primary/5 border border-primary/10 text-sm">
                      <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                      <p>{req.adminNotes}</p>
                    </div>
                  )}

                  {/* Admin actions for pending requests */}
                  {isAdmin && req.status === 'pending' && (
                    <div className="space-y-2 pt-1">
                      {showNotesFor === req.id && (
                        <Textarea
                          placeholder="Add notes (optional)..."
                          value={notesMap[req.id] || ''}
                          onChange={e => setNotesMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                          rows={2}
                          className="text-sm"
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowNotesFor(showNotesFor === req.id ? null : req.id)}
                          className="gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          Notes
                        </Button>
                        <div className="flex-1" />
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          disabled={reviewingId === req.id}
                          onClick={() => onReject?.(req.id, notesMap[req.id])}
                        >
                          {reviewingId === req.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <X className="w-3 h-3 mr-1" />}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          disabled={reviewingId === req.id}
                          onClick={() => onApprove?.(req.id, notesMap[req.id])}
                        >
                          {reviewingId === req.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                          Approve
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Faculty can delete pending requests */}
                  {!isAdmin && req.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete?.(req.id)}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel Request
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

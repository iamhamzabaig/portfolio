import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ConfirmDialog } from '../../components/ui/Dialog.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useDeleteMessage, useMessages } from '../../features/contact/api/contact.queries.js';

export default function Messages() {
  const messagesQuery = useMessages();
  const deleteMessage = useDeleteMessage();
  const messages = messagesQuery.data || [];
  const [toDelete, setToDelete] = useState(null);

  if (messagesQuery.isLoading && !messagesQuery.data) return <Spinner />;

  const confirmDelete = () => {
    if (!toDelete) return;
    deleteMessage.mutate(toDelete._id, { onSuccess: () => setToDelete(null) });
  };

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight text-ink">Messages</h1>
      <div className="grid gap-4">
        {messages.length ? (
          messages.map((message) => (
            <Card key={message._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{message.name} <span className="text-muted">&lt;{message.email}&gt;</span></p>
                  <p className="mt-3 text-body-sm text-muted">{message.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={`Delete message from ${message.name}`}
                  onClick={() => setToDelete(message)}
                >
                  <Trash2 aria-hidden="true" size={17} />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="rounded-card border border-border bg-panel p-5 text-muted">No messages yet.</p>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleteMessage.isPending}
        title="Delete message?"
        description={toDelete ? `The message from ${toDelete.name} will be permanently removed.` : ''}
      />
    </section>
  );
}

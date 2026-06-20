import { Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { useDeleteMessage, useMessages } from '../../features/contact/api/contact.queries.js';

export default function Messages() {
  const messagesQuery = useMessages();
  const deleteMessage = useDeleteMessage();
  const messages = messagesQuery.data || [];

  if (messagesQuery.isLoading && !messagesQuery.data) return <Spinner />;

  return (
    <section>
      <h1 className="mb-6 text-3xl font-semibold">Messages</h1>
      <div className="grid gap-4">
        {messages.length ? (
          messages.map((message) => (
            <Card key={message._id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{message.name} <span className="text-muted">&lt;{message.email}&gt;</span></p>
                  <p className="mt-3 text-sm leading-6 text-muted">{message.message}</p>
                </div>
                <Button variant="ghost" aria-label={`Delete message from ${message.name}`} onClick={() => deleteMessage.mutate(message._id)}>
                  <Trash2 aria-hidden="true" size={17} />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="rounded-lg border border-border bg-panel p-5 text-muted">No messages yet.</p>
        )}
      </div>
    </section>
  );
}

import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@heroui/react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { BottomSheet } from '../../components/layout/BottomSheet.jsx';
import { useDeleteMessage, useMessages } from '../../features/contact/api/contact.queries.js';

// Truncate in JS (not CSS) so the full body is only present in the detail sheet.
const preview = (text = '') => (text.length > 70 ? `${text.slice(0, 70)}…` : text);

export default function Messages() {
  const messagesQuery = useMessages();
  const deleteMessage = useDeleteMessage();
  const messages = messagesQuery.data || [];
  const [active, setActive] = useState(null);

  if (messagesQuery.isLoading && !messagesQuery.data) return <Spinner />;

  const remove = (id) => deleteMessage.mutate(id);

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl font-bold text-ink">Messages</h1>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table aria-label="Contact messages" removeWrapper>
          <TableHeader>
            <TableColumn>SENDER</TableColumn>
            <TableColumn>PREVIEW</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No messages yet.">
            {messages.map((message) => (
              <TableRow key={message._id}>
                <TableCell>
                  <p className="font-medium text-ink">{message.name}</p>
                  <p className="text-xs text-muted">{message.email}</p>
                </TableCell>
                <TableCell className="max-w-md text-sm text-muted">{preview(message.message)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setActive(message)}>View</Button>
                    <Button
                      variant="ghost"
                      aria-label={`Delete message from ${message.name}`}
                      onClick={() => remove(message._id)}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: card list; tapping a card opens the body in a sheet. */}
      <div className="grid gap-4 md:hidden">
        {messages.length ? (
          messages.map((message) => (
            <Card key={message._id} className="p-4">
              <button
                type="button"
                aria-label={`Open message from ${message.name}`}
                onClick={() => setActive(message)}
                className="w-full text-left"
              >
                <p className="font-medium text-ink">{message.name}</p>
                <p className="text-xs text-muted">{message.email}</p>
                <p className="mt-2 text-sm text-muted">{preview(message.message)}</p>
              </button>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  aria-label={`Delete message from ${message.name}`}
                  onClick={() => remove(message._id)}
                >
                  <Trash2 aria-hidden="true" size={16} />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <p className="rounded-lg border border-border bg-panel p-5 text-muted">No messages yet.</p>
        )}
      </div>

      <BottomSheet
        isOpen={Boolean(active)}
        onOpenChange={(open) => {
          if (!open) setActive(null);
        }}
        title={active?.name || 'Message'}
      >
        {active ? (
          <div className="grid gap-3">
            <p className="text-sm text-muted">{active.email}</p>
            <p className="whitespace-pre-wrap text-sm leading-6 text-ink">{active.message}</p>
            <Button
              variant="danger"
              onClick={() => {
                remove(active._id);
                setActive(null);
              }}
            >
              <Trash2 aria-hidden="true" size={16} /> Delete
            </Button>
          </div>
        ) : null}
      </BottomSheet>
    </section>
  );
}

import { Drawer, DrawerContent, DrawerHeader, DrawerBody } from '@heroui/react';

export function BottomSheet({ isOpen, onOpenChange, title, children }) {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="bottom"
      hideCloseButton
      classNames={{
        base: 'glass rounded-t-3xl max-h-[85vh]',
        wrapper: 'items-end'
      }}
    >
      <DrawerContent className="pb-safe">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-muted/40" aria-hidden="true" />
        {title ? <DrawerHeader className="font-display text-lg">{title}</DrawerHeader> : null}
        <DrawerBody>{children}</DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

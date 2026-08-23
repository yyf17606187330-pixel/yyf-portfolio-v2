import { useRef, useState } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NavigationOverlay } from './NavigationOverlay';

function NavigationHarness({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={openerRef} type="button" onClick={() => setOpen(true)}>
        打开菜单
      </button>
      <a href="#outside">外部链接</a>
      <NavigationOverlay
        open={open}
        opener={openerRef.current}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
      />
    </>
  );
}

describe('NavigationOverlay', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders as a modal portal and traps keyboard focus inside the menu', async () => {
    render(<NavigationHarness onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '打开菜单' }));

    const dialog = await screen.findByRole('dialog', { name: '全站导航' });
    const closeButton = screen.getByRole('button', { name: '关闭菜单' });
    const contactLink = screen.getByRole('link', { name: 'CONTACT' });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    await waitFor(() => expect(closeButton).toHaveFocus());

    contactLink.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(closeButton).toHaveFocus();

    closeButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(contactLink).toHaveFocus();
  });

  it('closes on Escape and restores focus to the menu opener', async () => {
    const onClose = vi.fn();
    render(<NavigationHarness onClose={onClose} />);
    const opener = screen.getByRole('button', { name: '打开菜单' });
    fireEvent.click(opener);

    await screen.findByRole('dialog', { name: '全站导航' });
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('dialog', { name: '全站导航' })).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });
});

import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { emit, listen, type UnlistenFn } from '@tauri-apps/api/event';

export async function openMiniWindow() {
  const mainWin = getCurrentWindow();

  // Check if mini window already exists
  const existing = await WebviewWindow.getByLabel('mini');
  if (existing) {
    await existing.setFocus();
    await mainWin.hide();
    return;
  }

  const mini = new WebviewWindow('mini', {
    url: '/mini.html',
    title: 'Smart Todo Mini',
    width: 320,
    height: 450,
    decorations: false,
    alwaysOnTop: true,
    resizable: false,
    center: true,
    transparent: true,
  });

  // Hide main window once mini is ready
  mini.once('tauri://created', () => {
    mainWin.hide();
  });
}

export async function expandToMain() {
  await emit('show-main');
  const current = getCurrentWindow();
  await current.close();
}

export function listenShowMain(callback: () => void): Promise<UnlistenFn> {
  return listen('show-main', callback);
}

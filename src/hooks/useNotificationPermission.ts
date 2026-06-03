import { useState, useCallback, useEffect } from 'react';

export type PermissionStatus = 'prompt' | 'granted' | 'denied' | 'unsupported';

export default function useNotificationPermission() {
  const [status, setStatus] = useState<PermissionStatus>('prompt');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    setStatus(Notification.permission as PermissionStatus);
  }, []);

  const request = useCallback(async (): Promise<PermissionStatus> => {
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return 'unsupported';
    }
    const result = await Notification.requestPermission();
    const perm = result as PermissionStatus;
    setStatus(perm);
    return perm;
  }, []);

  const send = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (status !== 'granted') return;
      try {
        new Notification(title, {
          icon: '/favicon.svg',
          silent: true,
          ...options,
        });
      } catch {
        // 忽略通知发送失败（如用户系统层面禁止）
      }
    },
    [status],
  );

  return { status, request, send } as const;
}

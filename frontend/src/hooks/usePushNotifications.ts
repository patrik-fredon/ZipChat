import { useEffect, useState } from 'react';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Kontrola podpory push notifikací
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      setError('Push notifikace nejsou podporovány v tomto prohlížeči');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Registrace service workeru
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        
        // Získání push tokenu
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });

        // Odeslání tokenu na server
        const response = await fetch('/api/push/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        });

        if (!response.ok) {
          throw new Error('Nepodařilo se zaregistrovat push notifikace');
        }

        const data = await response.json();
        setToken(data.token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba při registraci push notifikací');
    }
  };

  const unregister = async () => {
    if (!token) return;

    try {
      await fetch(`/api/push/unregister/${token}`, {
        method: 'DELETE',
      });

      setToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nastala chyba při zrušení registrace push notifikací');
    }
  };

  return {
    isSupported,
    permission,
    token,
    error,
    requestPermission,
    unregister,
  };
}; 
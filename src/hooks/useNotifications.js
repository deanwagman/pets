import { useContext } from 'react';
import { NotificationsContext } from '../state/notifications';

const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider',
    );
  }

  return context;
};

export default useNotifications;

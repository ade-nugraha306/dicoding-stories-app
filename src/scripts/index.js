// CSS imports
import '../styles/styles.css';

import App from './views/app';

import { registerServiceWorker, isUserSubscribed, subscribeUserToPush, unsubscribeUserFromPush } from './data/api';

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();
  // Inisialisasi App SPA
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();
  

  // Routing hashchange
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  // Skip to Content handler
  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1'); // supaya bisa difokuskan
        mainContent.focus();
      }
    });
  }
  const btn = document.getElementById('push-toggle-btn');
  if (!btn) return; // Jika tombol tidak ada, hentikan
  const registration = await navigator.serviceWorker.ready;

  async function updateButton() {
    const subscribed = await isUserSubscribed();
    btn.textContent = subscribed ? 'Unsubscribe' : 'Subscribe';
    btn.disabled = false;
  }

  btn.addEventListener('click', async () => {
    btn.disabled = true; // Disable tombol saat proses
    const subscribed = await isUserSubscribed();
    if (subscribed) {
      await unsubscribeUserFromPush();
    } else {
      await subscribeUserToPush(registration);
    }
    await updateButton();
  });

  await updateButton();
});

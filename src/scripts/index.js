// CSS imports
import '../styles/styles.css';

import App from './views/app';

import { registerServiceWorker, isUserSubscribed, subscribeUserToPush, unsubscribeUserFromPush } from './data/api';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('App starting...');
    
    // Daftarkan service worker dan tunggu pendaftarannya selesai
    const swRegistration = await registerServiceWorker();
    console.log('Service worker registration result:', swRegistration);
    
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
    
    // Setup push notification button dengan service worker yang sudah terdaftar
    await setupPushButton(swRegistration);
  } catch (error) {
    console.error('Error initializing app:', error);
    alert('Terjadi kesalahan: ' + error.message);
  }
});

async function setupPushButton(serviceWorkerReg) {
  try {
    console.log('Starting setupPushButton');
    alert('Starting to setup Push Button');
    
    const btn = document.getElementById('push-toggle-btn');
    if (!btn) {
      console.error('Button element not found!');
      alert('Push Button not found in DOM!');
      return;
    }
    
    console.log('Button found:', btn);
    alert('Push Button found in DOM');
    
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      btn.textContent = 'Push Not Supported';
      btn.disabled = true;
      alert('Push API not supported in this browser');
      return;
    }
    
    // Gunakan service worker registration yang diberikan atau tunggu yang sudah aktif
    let registration = serviceWorkerReg;
    if (!registration) {
      try {
        console.log('No SW registration provided, waiting for active SW...');
        registration = await navigator.serviceWorker.ready;
        console.log('Got active service worker:', registration);
      } catch (error) {
        console.error('Failed to get service worker registration:', error);
        alert('Service worker tidak siap: ' + error.message);
        btn.textContent = 'SW Error';
        btn.disabled = true;
        return;
      }
    }
    
    console.log('Using service worker registration:', registration);
    alert('Service Worker is ready');

    async function updateButton() {
      try {
        console.log('Updating button state...');
        const subscribed = await isUserSubscribed();
        console.log('User subscription status:', subscribed);
        btn.textContent = subscribed ? 'Unsubscribe' : 'Subscribe';
        btn.disabled = false;
        alert('Button updated: ' + (subscribed ? 'Unsubscribe' : 'Subscribe'));
      } catch (error) {
        console.error('Error updating button:', error);
        alert('Error updating button: ' + error.message);
        btn.textContent = 'Subscribe';
        btn.disabled = false;
      }
    }

    // Gunakan event listener berbasis click
    btn.onclick = async (event) => {
      try {
        console.log('Button clicked!', event);
        alert('Push button clicked!');
        event.preventDefault();
        
        btn.disabled = true; // Disable tombol saat proses
        const subscribed = await isUserSubscribed();
        if (subscribed) {
          console.log('Unsubscribing user...');
          alert('Attempting to unsubscribe...');
          await unsubscribeUserFromPush();
        } else {
          console.log('Subscribing user...');
          alert('Attempting to subscribe...');
          await subscribeUserToPush(registration);
        }
      } catch (error) {
        console.error('Push subscription error:', error);
        alert('Push subscription error: ' + error.message);
      } finally {
        await updateButton();
      }
    };

    console.log('Setting up button click handler using onclick');
    await updateButton();
  } catch (error) {
    console.error('Push button setup error:', error);
    alert('Push button setup error: ' + error.message);
  }
}

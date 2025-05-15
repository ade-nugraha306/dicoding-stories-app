// CSS imports
import '../styles/styles.css';

import App from './views/app';

import { registerServiceWorker, isUserSubscribed, subscribeUserToPush, unsubscribeUserFromPush } from './data/api';

document.addEventListener('DOMContentLoaded', async () => {
  try {
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
    
    // Setup push notification button
    setupPushButton();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
});

async function setupPushButton() {
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
    
    // Pastikan service worker benar-benar terdaftar
    let registration;
    try {
      registration = await navigator.serviceWorker.ready;
      console.log('Service worker siap:', registration);
      alert('Service Worker is ready');
    } catch (error) {
      console.error('Service worker belum siap, mencoba mendaftarkan ulang:', error);
      alert('Service Worker not ready, trying to register again: ' + error.message);
      // Coba ulang pendaftaran dengan path absolut
      try {
        const swUrl = new URL('/sw.js', window.location.href).href;
        console.log('Registering service worker with URL:', swUrl);
        registration = await navigator.serviceWorker.register(swUrl);
        console.log('Service worker berhasil didaftarkan:', registration);
        alert('Service Worker registered successfully');
      } catch (regError) {
        console.error('Failed to register service worker:', regError);
        alert('Failed to register service worker: ' + regError.message);
        return;
      }
    }

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

    btn.addEventListener('click', async (event) => {
      try {
        console.log('Button clicked!');
        alert('Push button clicked!');
        event.preventDefault();
        event.stopPropagation();
        
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
    });

    console.log('Adding button click listener done');
    alert('Button click handler added');
    await updateButton();
  } catch (error) {
    console.error('Push button setup error:', error);
    alert('Push button setup error: ' + error.message);
  }
}

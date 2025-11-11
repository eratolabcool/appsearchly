// Simplified browser entry point for our App Search MVP
import '~/styles/app-store.scss';
import AppSearchPage from '~/AppSearchPage.svelte';

export async function startSearchApplication() {
  console.log('Starting App Search Application...');

  // Using a container element to mount our app
  const container = document.querySelector('.body-container') || document.body;

  const app = new AppSearchPage({
    target: container,
  });

  console.log('App Search Application started successfully!');
  return app;
}

// Start the application
if (!import.meta.env?.VITEST) {
  startSearchApplication();
}
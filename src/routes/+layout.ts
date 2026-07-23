// During the P0 migration, prerender routes that are discoverable at build time
// while allowing dynamic routes to fall back to the static adapter's SPA shell.
export const prerender = 'auto';
export const ssr = true;
export const trailingSlash = 'never';
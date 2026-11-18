/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** the signed-in staff member, on /admin routes */
    user: import('./server/auth/session').SessionUser | null;
  }
}

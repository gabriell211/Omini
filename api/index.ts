/**
 * Vercel requires serverless functions under the project's root `api/`
 * directory. The API implementation remains isolated in `apps/api` while
 * this entry point lets the Vercel project build the complete monorepo.
 */
export { default } from "../apps/api/api/index";

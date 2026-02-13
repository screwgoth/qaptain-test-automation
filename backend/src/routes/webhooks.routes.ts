/**
 * Webhooks Routes
 * CI/CD integrations (GitHub, GitLab, etc.)
 */

import { Router } from 'express';
import * as webhooksController from '../controllers/webhooks.controller';

const router = Router();

// Webhook endpoints (no auth - verified by payload signature)
router.post('/github', webhooksController.handleGitHubWebhook);
router.post('/gitlab', webhooksController.handleGitLabWebhook);
router.post('/generic', webhooksController.handleGenericWebhook);

export default router;

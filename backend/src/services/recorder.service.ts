/**
 * Playwright Test Recorder Service
 * Manages browser instances and records user interactions
 */

import { chromium, firefox, webkit, Browser, BrowserContext, Page } from 'playwright';
import { EventEmitter } from 'events';

export interface RecordedAction {
  id: string;
  type: 'click' | 'fill' | 'press' | 'navigate' | 'select' | 'check' | 'uncheck' | 'hover' | 'screenshot' | 'assert';
  selector?: string;
  value?: string;
  url?: string;
  key?: string;
  timestamp: number;
  description: string;
}

export interface RecorderSession {
  id: string;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  actions: RecordedAction[];
  status: 'idle' | 'recording' | 'paused' | 'completed' | 'error';
  targetUrl: string;
}

class RecorderService extends EventEmitter {
  private sessions: Map<string, RecorderSession> = new Map();

  /**
   * Start a new recording session
   */
  async startSession(
    sessionId: string,
    targetUrl: string,
    options: {
      browserType?: 'chromium' | 'firefox' | 'webkit';
      viewport?: { width: number; height: number };
      headless?: boolean;
    } = {}
  ): Promise<{ wsEndpoint: string }> {
    const {
      browserType = 'chromium',
      viewport = { width: 1280, height: 720 },
      headless = false,
    } = options;

    // Launch browser
    const browserLauncher = browserType === 'firefox' ? firefox : browserType === 'webkit' ? webkit : chromium;
    
    const browser = await browserLauncher.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
      viewport,
      recordVideo: { dir: '/tmp/recordings' },
    });

    const page = await context.newPage();

    // Create session
    const session: RecorderSession = {
      id: sessionId,
      browser,
      context,
      page,
      actions: [],
      status: 'idle',
      targetUrl,
    };

    this.sessions.set(sessionId, session);

    // Setup event listeners for recording
    this.setupPageListeners(session);

    // Navigate to target URL
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    
    // Add initial navigation action
    this.addAction(sessionId, {
      type: 'navigate',
      url: targetUrl,
      description: `Navigate to ${targetUrl}`,
    });

    session.status = 'recording';
    this.emit('sessionStarted', { sessionId, targetUrl });

    return { wsEndpoint: '' };
  }

  /**
   * Setup page event listeners for recording
   */
  private setupPageListeners(session: RecorderSession): void {
    const { page, id: sessionId } = session;

    // Inject recording script into page
    page.on('load', async () => {
      await this.injectRecorderScript(page, sessionId);
    });

    // Listen for console messages from injected script
    page.on('console', async (msg) => {
      if (msg.type() === 'info') {
        try {
          const text = msg.text();
          if (text.startsWith('QAPTAIN_ACTION:')) {
            const actionData = JSON.parse(text.replace('QAPTAIN_ACTION:', ''));
            this.handleRecordedAction(sessionId, actionData);
          }
        } catch {
          // Not a Qaptain action, ignore
        }
      }
    });

    // Track navigation
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        if (session.actions.length > 0) {
          const lastAction = session.actions[session.actions.length - 1];
          if (lastAction.type !== 'navigate' || lastAction.url !== url) {
            this.addAction(sessionId, {
              type: 'navigate',
              url,
              description: `Navigate to ${url}`,
            });
          }
        }
      }
    });
  }

  /**
   * Inject recording script into page
   */
  private async injectRecorderScript(page: Page, sessionId: string): Promise<void> {
    await page.evaluate(() => {
      // Prevent duplicate injection
      if ((window as any).__qaptainRecorderInjected) return;
      (window as any).__qaptainRecorderInjected = true;

      const getSelector = (element: Element): string => {
        // Try data-testid first
        if (element.getAttribute('data-testid')) {
          return `[data-testid="${element.getAttribute('data-testid')}"]`;
        }
        
        // Try id
        if (element.id) {
          return `#${element.id}`;
        }

        // Try unique class combination
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ').filter(c => c.trim());
          if (classes.length > 0) {
            const selector = '.' + classes.join('.');
            if (document.querySelectorAll(selector).length === 1) {
              return selector;
            }
          }
        }

        // Try name attribute for form elements
        if (element.getAttribute('name')) {
          return `[name="${element.getAttribute('name')}"]`;
        }

        // Try aria-label
        if (element.getAttribute('aria-label')) {
          return `[aria-label="${element.getAttribute('aria-label')}"]`;
        }

        // Try placeholder for inputs
        if (element.getAttribute('placeholder')) {
          return `[placeholder="${element.getAttribute('placeholder')}"]`;
        }

        // Fallback to text content for buttons/links
        const tagName = element.tagName.toLowerCase();
        if (['button', 'a'].includes(tagName)) {
          const text = element.textContent?.trim();
          if (text && text.length < 50) {
            return `${tagName}:has-text("${text}")`;
          }
        }

        // Last resort: generate path
        const path: string[] = [];
        let current: Element | null = element;
        while (current && current !== document.body) {
          let selector = current.tagName.toLowerCase();
          if (current.id) {
            selector = `#${current.id}`;
            path.unshift(selector);
            break;
          }
          const parent: Element | null = current.parentElement;
          if (parent) {
            const currentTag = current.tagName;
            const siblings = Array.from(parent.children).filter(
              (c: Element) => c.tagName === currentTag
            );
            if (siblings.length > 1) {
              const index = siblings.indexOf(current) + 1;
              selector += `:nth-of-type(${index})`;
            }
          }
          path.unshift(selector);
          current = parent;
        }
        return path.join(' > ');
      };

      const sendAction = (action: any) => {
        console.info('QAPTAIN_ACTION:' + JSON.stringify(action));
      };

      // Click listener
      document.addEventListener('click', (e) => {
        const target = e.target as Element;
        if (!target) return;

        const selector = getSelector(target);
        const tagName = target.tagName.toLowerCase();
        const text = target.textContent?.trim().substring(0, 30) || '';

        sendAction({
          type: 'click',
          selector,
          description: `Click on ${tagName}${text ? ` "${text}"` : ''}`,
        });
      }, true);

      // Input listener
      document.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (!target) return;

        const selector = getSelector(target);
        const inputType = target.type || 'text';
        
        // Debounce input events
        clearTimeout((target as any).__qaptainInputTimeout);
        (target as any).__qaptainInputTimeout = setTimeout(() => {
          sendAction({
            type: 'fill',
            selector,
            value: target.value,
            description: `Fill ${inputType} input with "${target.value.substring(0, 20)}${target.value.length > 20 ? '...' : ''}"`,
          });
        }, 500);
      }, true);

      // Change listener for select elements
      document.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        if (!target || target.tagName.toLowerCase() !== 'select') return;

        const selector = getSelector(target);
        const selectedOption = target.options[target.selectedIndex];

        sendAction({
          type: 'select',
          selector,
          value: target.value,
          description: `Select "${selectedOption?.text || target.value}"`,
        });
      }, true);

      // Keyboard listener for special keys
      document.addEventListener('keydown', (e) => {
        const specialKeys = ['Enter', 'Tab', 'Escape', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (specialKeys.includes(e.key)) {
          const target = e.target as Element;
          const selector = target ? getSelector(target) : 'body';

          sendAction({
            type: 'press',
            selector,
            key: e.key,
            description: `Press ${e.key} key`,
          });
        }
      }, true);

      console.log('Qaptain Recorder injected successfully');
    });
  }

  /**
   * Handle recorded action from page
   */
  private handleRecordedAction(sessionId: string, actionData: Partial<RecordedAction>): void {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'recording') return;

    this.addAction(sessionId, actionData);
  }

  /**
   * Add action to session
   */
  private addAction(sessionId: string, actionData: Partial<RecordedAction>): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const action: RecordedAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: actionData.type || 'click',
      selector: actionData.selector,
      value: actionData.value,
      url: actionData.url,
      key: actionData.key,
      timestamp: Date.now(),
      description: actionData.description || '',
    };

    session.actions.push(action);
    this.emit('actionRecorded', { sessionId, action });
  }

  /**
   * Pause recording
   */
  pauseSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'recording') {
      session.status = 'paused';
      this.emit('sessionPaused', { sessionId });
    }
  }

  /**
   * Resume recording
   */
  resumeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'paused') {
      session.status = 'recording';
      this.emit('sessionResumed', { sessionId });
    }
  }

  /**
   * Stop recording and generate code
   */
  async stopSession(sessionId: string): Promise<{ actions: RecordedAction[]; code: string }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'completed';

    // Generate Playwright code
    const code = this.generatePlaywrightCode(session.actions, session.targetUrl);

    // Close browser
    await session.context.close();
    await session.browser.close();

    const actions = [...session.actions];
    this.sessions.delete(sessionId);

    this.emit('sessionCompleted', { sessionId, actions, code });

    return { actions, code };
  }

  /**
   * Generate Playwright test code from recorded actions
   */
  generatePlaywrightCode(actions: RecordedAction[], baseUrl: string): string {
    const lines: string[] = [
      `import { test, expect } from '@playwright/test';`,
      ``,
      `test('Recorded Test', async ({ page }) => {`,
    ];

    for (const action of actions) {
      let line = '  ';
      switch (action.type) {
        case 'navigate':
          line += `await page.goto('${action.url}');`;
          break;
        case 'click':
          line += `await page.locator('${action.selector}').click();`;
          break;
        case 'fill':
          line += `await page.locator('${action.selector}').fill('${this.escapeString(action.value || '')}');`;
          break;
        case 'press':
          line += `await page.locator('${action.selector}').press('${action.key}');`;
          break;
        case 'select':
          line += `await page.locator('${action.selector}').selectOption('${action.value}');`;
          break;
        case 'check':
          line += `await page.locator('${action.selector}').check();`;
          break;
        case 'uncheck':
          line += `await page.locator('${action.selector}').uncheck();`;
          break;
        case 'hover':
          line += `await page.locator('${action.selector}').hover();`;
          break;
        default:
          line += `// Unknown action: ${action.type}`;
      }
      lines.push(line);
    }

    lines.push(`});`);
    lines.push(``);

    return lines.join('\n');
  }

  /**
   * Escape string for code generation
   */
  private escapeString(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
  }

  /**
   * Get session info
   */
  getSession(sessionId: string): RecorderSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): RecorderSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Add assertion to recording
   */
  addAssertion(sessionId: string, assertion: { selector: string; type: string; expected?: string }): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    let description = '';
    switch (assertion.type) {
      case 'visible':
        description = `Assert element is visible: ${assertion.selector}`;
        break;
      case 'text':
        description = `Assert text equals "${assertion.expected}"`;
        break;
      case 'value':
        description = `Assert value equals "${assertion.expected}"`;
        break;
      default:
        description = `Assert ${assertion.type}`;
    }

    this.addAction(sessionId, {
      type: 'assert',
      selector: assertion.selector,
      value: assertion.expected,
      description,
    });
  }

  /**
   * Take screenshot during recording
   */
  async takeScreenshot(sessionId: string): Promise<string | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const screenshotPath = `/tmp/recordings/screenshot_${sessionId}_${Date.now()}.png`;
    await session.page.screenshot({ path: screenshotPath, fullPage: true });

    this.addAction(sessionId, {
      type: 'screenshot',
      description: 'Take screenshot',
    });

    return screenshotPath;
  }

  /**
   * Delete action from session
   */
  deleteAction(sessionId: string, actionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const index = session.actions.findIndex(a => a.id === actionId);
    if (index === -1) return false;

    session.actions.splice(index, 1);
    this.emit('actionDeleted', { sessionId, actionId });
    return true;
  }

  /**
   * Update action in session
   */
  updateAction(sessionId: string, actionId: string, updates: Partial<RecordedAction>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const action = session.actions.find(a => a.id === actionId);
    if (!action) return false;

    Object.assign(action, updates);
    this.emit('actionUpdated', { sessionId, action });
    return true;
  }
}

// Export singleton instance
export const recorderService = new RecorderService();

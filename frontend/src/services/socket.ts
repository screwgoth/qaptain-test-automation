/**
 * Socket.IO Client Service
 * Real-time updates for test runs
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem('qaptain_token');

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinTestRun(runId: string) {
    if (this.socket) {
      this.socket.emit('join-test-run', runId);
    }
  }

  leaveTestRun(runId: string) {
    if (this.socket) {
      this.socket.emit('leave-test-run', runId);
    }
  }

  onTestRunProgress(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('test-run-progress', callback);
    }
  }

  onTestRunComplete(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('test-run-complete', callback);
    }
  }

  offTestRunProgress(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('test-run-progress', callback);
    }
  }

  offTestRunComplete(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('test-run-complete', callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;

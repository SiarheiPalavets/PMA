import { environment } from 'src/environments/environment.development';
import { CurrentUserInterface } from './../../auth/types/current-user';
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SockectService {
  sockect!: Socket | undefined;

  constructor() {}
  setupSocketConnection(currentUser: CurrentUserInterface): void {
    this.sockect = io(environment.socketUrl, {
      auth: {
        token: currentUser.token,
      },
    });
  }

  disconnect(): void {
    if (!this.sockect) {
      throw new Error('Socket connection is not establish');
    }

    this.sockect.disconnect();
  }

  emit(eventName: string, message: any): void {
    this.sockect?.emit(eventName, message);
  }

  listen<T>(eventName: string): Observable<T> {
    const socket = this.sockect;
    if (!socket) {
      throw new Error('Socket connectio is nor establish');
    }

    return new Observable((subscriber) => {
      socket.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }
}

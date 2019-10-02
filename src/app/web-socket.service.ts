import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private socket: any;
  private readonly uri: string = 'ws://localhost:3000';
  // private readonly uri: string = 'ws://eslequerson-server.herokuapp.com/';

  constructor() {
    this.socket = io(this.uri);
  }

  public listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }

  public emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }
}

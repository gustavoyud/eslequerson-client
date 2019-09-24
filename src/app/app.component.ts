import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const HEADER_COLOR = '#3D5AFE';
interface Conversa {
  name: string;
  message: string;
  color: string;
  hour?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public conversas: Conversa[] = [];
  public name = '';
  public mensagem = '';
  public cor = '';
  public foiEnviado = false;

  /**
   * Controla as desincrições
   */
  private destroy$: Subject<void> = new Subject();

  constructor(private ws: WebSocketService) {}

  ngOnInit() {
    this.getColor();
    this.getPreviousMessages();
    this.listenToNewMessages();
  }

  public getColor(): void {
    const color = `#${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    if (color !== HEADER_COLOR) {
      this.cor = color;
    } else {
      this.cor = '#FFF';
    }
  }

  private listenToNewMessages(): void {
    this.ws
      .listen('newMessage')
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa: Conversa) => {
        this.conversas.push(conversa);
      });
  }

  private getPreviousMessages(): void {
    this.ws
      .listen('previousMessages')
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversas: Conversa[]) => {
        this.conversas = conversas;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public enviar(): void {

    const regex = /[0-9]{2}:[0-9]{2}/;

    const now = new Date();
    const [hour] = regex.exec(now.toISOString().split('T')[1]);

    const conversa = {
      name: this.name,
      message: this.mensagem,
      color: this.cor,
      hour
    };
    this.foiEnviado = true;
    this.mensagem = '';
    this.conversas.push(conversa);
    this.ws.emit('receivedMessage', conversa);
  }
}

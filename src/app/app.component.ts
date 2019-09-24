import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Cor padrão do Eslequerson
 */
const HEADER_COLOR = '#4b154c';

/**
 * Interface de conversa
 */
export interface Conversation {
  name: string;
  message: string;
  color: string;
  hour?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  /**
   * Lista de conversas
   */
  public conversations: Conversation[] = [];

  /**
   * Nome do usuário
   */
  public name = '';

  /**
   * Cor do usuário
   */
  public color = '';

  /**
   * Mensagem escrita pelo usuário
   */
  public message = '';

  /**
   * Se o usuário já enviou alguma mensagem
   */
  public hasSended = false;

  /**
   * Controla as desincrições
   */
  private destroy$: Subject<void> = new Subject();

  /**
   * Construtor
   *
   * @param { WebSocketService } ws - Websocket service
   */
  constructor(private ws: WebSocketService) {}

  /**
   * Inicializado
   */
  ngOnInit() {
    this.getColor();
    this.getPreviousMessages();
    this.listenToNewMessages();
  }

  /**
   * Destrutor
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Define um valor hexadecimal randômico
   */
  public getColor(): void {
    const color = `#${Math.random()
      .toString(16)
      .slice(2, 8)
      .toUpperCase()}`;
    if (color !== HEADER_COLOR) {
      this.color = color;
    } else {
      this.color = '#FFF';
    }
  }

  /**
   * Ouve por novas mensagens
   */
  private listenToNewMessages(): void {
    this.ws
      .listen('newMessage')
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversa: Conversation) => {
        this.conversations.push(conversa);
      });
  }

  /**
   * Recebe as mensagens anteriores
   */
  private getPreviousMessages(): void {
    this.ws
      .listen('previousMessages')
      .pipe(takeUntil(this.destroy$))
      .subscribe((conversas: Conversation[]) => {
        this.conversations = conversas;
      });
  }

  /**
   * Envia a mensagem para o servidor
   */
  public send(): void {
    const regex: RegExp = /[0-9]{2}:[0-9]{2}/;
    const now: Date = new Date();
    const [hour] = regex.exec(now.toISOString().split('T')[1]);

    const conversa: Conversation = {
      name: this.name,
      message: this.message,
      color: this.color,
      hour,
    };

    if (this.message) {
      this.hasSended = true;
      this.message = '';
      this.conversations.push(conversa);
      this.ws.emit('receivedMessage', conversa);
    }
  }
}

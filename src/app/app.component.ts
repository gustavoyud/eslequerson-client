import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from './web-socket.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, throttleTime, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

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
  public message = new FormControl('');

  /**
   * Se o usuário já enviou alguma mensagem
   */
  public hasSended = false;

  /**
   * Controla os eventos de escrita
   */
  public typing = new BehaviorSubject<string>('');

  /**
   * Controla a lista de usuários que ficaram ativos recentemente
   */
  public visibleList = new BehaviorSubject<any[]>([]);

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
    this.typingHandler();
    this.listenToStatusChanged();
  }

  /**
   * Destrutor
   */
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Eventos para mostrar quem está digitando no momento
   */
  private typingHandler(): void {
    this.typingEventsEmit();
    this.typingEventsListener();
  }

  /**
   * Dispara os eventos de digitação
   */
  private typingEventsEmit(): void {
    this.message.valueChanges
      .pipe(
        throttleTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.ws.emit('typing', { author: this.name });
      });
    this.message.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.ws.emit('stop', {});
      });
  }

  /**
   * Ouve os eventos de digitação
   */
  private typingEventsListener(): void {
    this.ws
      .listen('isTyping')
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ author }) => {
        if (author !== this.name) {
          this.typing.next(`${author} está digitando...`);
        }
      });
    this.ws
      .listen('stopTyping')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.typing.next('');
      });
  }

  /**
   * Ouve os eventos de conexão de um novo usuário
   */
  private listenToStatusChanged() {
    this.ws.listen('newStatus').subscribe(({ author, visible }) => {
      if (author !== this.name && visible === 'on') {
        const object = {
          author,
          text: 'Acabou de entrar!',
        };
        this.visibleList.next([...this.visibleList.value, object]);
      }
    });
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
      message: this.message.value,
      color: this.color,
      hour,
    };

    if (this.message.value) {
      this.hasSended = true;
      this.message.setValue('');
      this.conversations.push(conversa);
      this.ws.emit('receivedMessage', conversa);
      this.ws.emit('stop', {});
    }
  }

  public remove(index: number): void {
    const list = this.visibleList.value;
    list.splice(index, 1);

    this.visibleList.next(list);
  }
}

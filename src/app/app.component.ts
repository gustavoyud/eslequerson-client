import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, throttleTime } from 'rxjs/operators';
import { WebSocketService } from './web-socket.service';
import { UserService } from './services/user.service';


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
   * Controla as desincrições
   */
  private destroy$: Subject<void> = new Subject();

  /**
   * Construtor
   *
   * @param { WebSocketService } ws - Websocket service
   */
  constructor(private ws: WebSocketService, public user: UserService) {}

  /**
   * Inicializado
   */
  ngOnInit() {
    this.getPreviousMessages();
    this.listenToNewMessages();
    this.typingHandler();
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
        this.ws.emit('typing', { author: this.user.getUser().name });
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
        if (author !==  this.user.getUser().name) {
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
      name:  this.user.getUser().name,
      message: this.message.value,
      color:  this.user.getUser().color,
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
}

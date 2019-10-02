import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../services/user.service';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-user-connected',
  templateUrl: './user-connected.component.html',
  styleUrls: ['./user-connected.component.scss'],
})
export class UserConnectedComponent implements OnInit {
  /**
   * Controla a lista de usuários que ficaram ativos recentemente
   */
  public visibleList = new BehaviorSubject<any[]>([]);

  /**
   * Construtor
   *
   * @param { WebSocketService } ws - Serviço de websocket
   * @param { UserService } user - Singleton do usuário
   */
  constructor(private ws: WebSocketService, private user: UserService) {}

  /**
   * Inicializador
   */
  ngOnInit() {
    this.listenToStatusChanged();
  }

  /**
   * Ouve os eventos de conexão de um novo usuário
   */
  private listenToStatusChanged() {
    this.ws.listen('newStatus').subscribe(({ author, visible }) => {
      if (author !== this.user.getUser().name && visible === 'on') {
        const object = {
          author,
          text: 'Acabou de entrar!',
        };
        this.visibleList.next([...this.visibleList.value, object]);
      }
    });
  }

  /**
   * Remove a notificação selecionada da lista
   *
   * @param index - index da notificação selecionada
   */
  public remove(index: number): void {
    const list = this.visibleList.value;
    list.splice(index, 1);
    this.visibleList.next(list);
  }
}

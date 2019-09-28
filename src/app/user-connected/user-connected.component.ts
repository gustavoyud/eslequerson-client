import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WebSocketService } from '../web-socket.service';

@Component({
  selector: 'app-user-connected',
  templateUrl: './user-connected.component.html',
  styleUrls: ['./user-connected.component.scss'],
})
export class UserConnectedComponent implements OnInit {

  @Input() name: string;

  /**
   * Controla a lista de usuários que ficaram ativos recentemente
   */
  public visibleList = new BehaviorSubject<any[]>([]);

  constructor(private ws: WebSocketService) {}

  ngOnInit() {
    this.listenToStatusChanged();
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

  public remove(index: number): void {
    const list = this.visibleList.value;
    list.splice(index, 1);

    this.visibleList.next(list);
  }
}

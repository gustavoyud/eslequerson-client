import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WebSocketService } from '../web-socket.service';
import { UserService } from '../services/user.service';

/**
 * Componente da sidebar contendo 'logo' e seleção do nome
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {

  /**
   * Se o usuário já enviou alguma mensagem
   */
  @Input() hasSended = false;

  /**
   * Emite o método para atualizar a cor
   */
  @Output() suffleColor = new EventEmitter();

  public displayConfig = false;

  public status: 'on' | 'off' = 'off';

  /**
   * Construtor
   *
   * @param { WebSocketService } ws - Serviço de web sockets
   */
  constructor(private ws: WebSocketService, public user: UserService) {}

  /**
   * Inicializador
   */
  ngOnInit() {}

  /**
   * Atualiza o status do usuário
   *
   * @param { any } visible - Se é visível ou não
   */
  public changeStatus(visible: any): void {
    this.ws.emit('statusChanged', { author: this.user.getUser().name, visible });
  }
}

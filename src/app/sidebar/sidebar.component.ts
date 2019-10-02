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

  /**
   * Atual nome que será mostrado no status
   */
  public statuName = '';

  /**
   * Configuração do status
   */
  public displayConfig = false;

  /**
   * Status do usuário
   */
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
    this.ws.emit('statusChanged', { author: this.statuName, visible });
  }

  /**
   * Chama a atenção do usuário
   */
  public drawAttention(): void {
    const regex: RegExp = /[0-9]{2}:[0-9]{2}/;
    const now: Date = new Date();
    const [hour] = regex.exec(now.toISOString().split('T')[1]);

    const attention = {
      name: this.user.getUser().name,
      color: this.user.getUser().color,
      message: 'presta atenção!',
      hour,
      attention: true
    };
    this.ws.emit('drawAttention', attention);
  }
}

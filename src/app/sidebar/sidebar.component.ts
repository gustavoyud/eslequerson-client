import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { WebSocketService } from '../web-socket.service';

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
   * Nome do usuário
   */
  @Input() name = '';

  /**
   * Cor do Avatar
   */
  @Input() color = '';

  /**
   * Se o usuário já enviou alguma mensagem
   */
  @Input() hasSended = false;

  /**
   * Emite o método para atualizar a cor
   */
  @Output() suffleColor = new EventEmitter();

  /**
   * Emite o método pra atualizar o nome
   */
  @Output() nameHasChanged = new EventEmitter();

  public status: 'on' | 'off' = 'off';

  /**
   * Construtor
   *
   * @param { WebSocketService } ws - Serviço de web sockets
   */
  constructor(private ws: WebSocketService) {}

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
    this.ws.emit('statusChanged', { author: this.name, visible });
  }
}

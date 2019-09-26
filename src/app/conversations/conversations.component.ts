import { Component, Input } from '@angular/core';
import { Conversation } from '../app.component';

/**
 * Componente para listar as conversas
 */
@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss'],
})
export class ConversationsComponent {
  /**
   * Lista de conversas
   */
  @Input() conversations: Conversation[] = [];

  /**
   * Construtor
   */
  constructor() {}
}

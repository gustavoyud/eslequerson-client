import { Component, Input } from '@angular/core';

/**
 * Componente do cabeçalho genérico
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  /**
   * Titulo da página
   */
  @Input() title = '';

  /**
   * Subtitulo da página
   */
  @Input() subtitle = '';

  /**
   * Construtor
   */
  constructor() {}
}

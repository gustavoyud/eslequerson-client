import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';

/**
 * Cor padrão do Eslequerson
 */
const HEADER_COLOR = '#4b154c';

@Component({
  selector: 'app-name-getter',
  templateUrl: './name-getter.component.html',
  styleUrls: ['./name-getter.component.scss'],
})
export class NameGetterComponent implements OnInit {
  public name = '';

  constructor(private user: UserService) {}

  ngOnInit() {}

  public setUser(): void {
    this.getColor();
    const user: User = {
      name: this.name,
      color: this.getColor(),
    };
    this.user.setUser(user);
  }

  /**
   * Define um valor hexadecimal randômico
   */
  public getColor(): string {
    let defaultColor = '#7E2480';
    const color = `#${Math.random()
      .toString(16)
      .slice(2, 8)
      .toUpperCase()}`;

    if (color !== HEADER_COLOR) {
      defaultColor = color;
    }

    return defaultColor;
  }
}

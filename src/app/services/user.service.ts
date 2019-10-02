import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  name?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private user$ = new BehaviorSubject<User>({});

  constructor() { }

  public setUser(user: User): void {
    this.user$.next(user);
  }

  public getUser(): User {
    return this.user$.value;
  }

  public userHasChanged(): Observable<User> {
    return this.user$.asObservable();
  }
}

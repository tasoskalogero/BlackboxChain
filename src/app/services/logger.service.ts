import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {
  logerText: string;


  constructor() {
    this.logerText = '';
  }
  add(message: string) {
    let dt = new Date();
    let utcDate = dt.toLocaleString();

    let new_msg = utcDate + ': ' + message;
    this.logerText = this.logerText + "\n" + new_msg;
  }

  clearLog() {
    this.logerText = '';
  }

  getLoggedMessages() {
    return this.logerText;
  }
}

import { Component, OnInit } from '@angular/core';
import {LoggerService} from '../../services/logger.service';

@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.css']
})
export class LoggerComponent implements OnInit {

  constructor(public loggerService: LoggerService) {
  }

  ngOnInit() {
  }
}

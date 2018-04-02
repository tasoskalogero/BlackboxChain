import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {SoftwareService} from '../../../services/software.service';
import {CommunicationService} from '../../../services/communication.service';
import {Software} from '../../../models/models';

@Component({
  selector: 'app-software-layout',
  templateUrl: './software-layout.component.html',
  styleUrls: ['./software-layout.component.css']
})
export class SoftwareLayoutComponent implements OnInit  {

  fetchedSoftware: Software[];
  selectedSoftware: Software;


  constructor(private fb: FormBuilder,
              private softwareService: SoftwareService,
              private communicationService:CommunicationService,
  ) {
  }

  ngOnInit() {
    this.getSoftware();
  }


  getSoftware(): void {
    this.clear();
    this.softwareService.getSoftwareInfo()
      .then(software => {
        this.fetchedSoftware = software;
      })
  }

  setSelected(software: Software) {
    this.selectedSoftware = software;
    console.log('[SELECTED SOFTWARE]',software);
    this.communicationService.announceSoftware(software);
  }

  clear() {
    this.communicationService.announceSoftware(null);
    if(this.selectedSoftware)
      this.selectedSoftware = null;
  }
}

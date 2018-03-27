import {Component, OnInit, ViewChild} from '@angular/core';
import {LoggerService} from '../../../services/logger.service';
import {CommunicationService} from '../../../services/communication.service';


@Component({
  selector: 'app-pub-key-upload',
  templateUrl: './pubKeyUpload-layout.component.html',
  styleUrls: ['./pubKeyUpload-layout.component.css']
})

export class PubKeyUploadLayoutComponent implements OnInit {
  @ViewChild('pubFileInput')
  pubKeyFileInputVariable: any;   //used by ViewChild

  private uploadedPubKeyFile: File;


  public constructor(
    private loggerService: LoggerService,
    private communicationService:CommunicationService) {
  }

  ngOnInit(){
  }

  onChange(event) {
    if(event.srcElement.files[0] != null) {
      this.uploadedPubKeyFile = event.srcElement.files[0];

      this.loggerService.add(this.uploadedPubKeyFile.name + " uploaded");
      console.log(this.uploadedPubKeyFile.name + ' uploaded');

      this.communicationService.announceUserPubKeyFileUpload(this.uploadedPubKeyFile);
    } else {
      this.communicationService.announceUserPubKeyFileUpload(null);
    }
  }


  removeFile() {
    this.communicationService.announceUserPubKeyFileUpload(null);
    if(this.uploadedPubKeyFile) {
      this.uploadedPubKeyFile = null;
      this.pubKeyFileInputVariable.nativeElement.value = "";
    }
  }
}

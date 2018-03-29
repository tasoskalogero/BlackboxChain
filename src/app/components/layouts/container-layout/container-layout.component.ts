import { Component, Input, OnInit } from "@angular/core";
import { ContainerService } from "../../../services/container.service";
import { CommunicationService } from "../../../services/communication.service";
import { Web3Service } from "../../../util/web3.service";
import * as FileSaver from "file-saver";
import { Container } from "../../../models/models";

@Component({
  selector: "app-container-layout",
  templateUrl: "./container-layout.component.html",
  styleUrls: ["./container-layout.component.css"]
})
export class ContainerLayoutComponent implements OnInit {
  @Input() selectedContainerID: string;

  fetchedContainers: Container[];
  selectedContainer: Container;
  containerIDToPubKey: { [id: string]: string } = {};

  constructor(
    private web3Service: Web3Service,
    private containerService: ContainerService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.getContainers();
  }

  getContainers(): void {
    this.clear();
    this.containerService.getContainersFromDB().then(containers => {
      containers.map(
        container =>
          (this.containerIDToPubKey[container.dockerID] = container.publicKey)
      );
      this.fetchedContainers = containers;
    });
  }

  setSelected(container: Container) {
    this.selectedContainer = container;
    console.log("[SELECTED CONTAINER]", container);
    this.communicationService.announceContainer(container);
  }

  clear() {
    this.communicationService.announceContainer(null);
    if (this.selectedContainer) this.selectedContainer = null;
  }

  downloadPublicKey(containerID) {
    // let saveAs = require('file-saver');
    let pubKeyContents = this.containerIDToPubKey[containerID];
    let file = new Blob([pubKeyContents], { type: "text;charset=utf-8" });
    FileSaver.saveAs(file, "publicKey.pem");
  }
}

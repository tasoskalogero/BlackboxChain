import { Component, Input, OnInit } from "@angular/core";
import { Dataset } from "../../../models/models";
import { Web3Service } from "../../../util/web3.service";
import { CommunicationService } from "../../../services/communication.service";
import { DatasetService } from "../../../services/dataset.service";

@Component({
  selector: "app-dataset-layout",
  templateUrl: "./dataset-layout.component.html",
  styleUrls: ["./dataset-layout.component.css"]
})
export class DatasetLayoutComponent implements OnInit {
  @Input() selectedDatasetID: string;

  fetchedDatasets: Dataset[];
  selectedDataset: Dataset;

  constructor(
    private web3Service: Web3Service,
    private datasetService: DatasetService,
    private communicationService: CommunicationService
  ) {}

  ngOnInit() {
    this.getDatasets();
  }

  getDatasets(): void {
    this.clear();
    this.datasetService.getDatasets().then(datasets => {
      this.fetchedDatasets = datasets;
    });
  }

  setSelected(dataset: Dataset) {
    this.selectedDataset = dataset;
    console.log("[SELECTED DATASET]", dataset);
    this.communicationService.announceDataset(dataset);
  }

  clear() {
    this.communicationService.announceDataset(null);
    if (this.selectedDataset) this.selectedDataset = null;
  }
}

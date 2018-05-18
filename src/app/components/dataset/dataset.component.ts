import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DatasetService} from '../../services/dataset.service';
import {Web3Service} from '../../util/web3.service';
import {LoggerService} from '../../services/logger.service';

@Component({
    selector: 'app-dataset',
    templateUrl: './dataset.component.html',
    styleUrls: ['./dataset.component.css']
})
export class DatasetComponent implements OnInit {

    datasetForm: FormGroup;
    private txStatus: string;
    private web3: any;

    constructor(
        private fb: FormBuilder,
        private web3Service: Web3Service,
        private loggerService: LoggerService,
        private datasetService: DatasetService
    ) {
    }

    ngOnInit() {
        this.web3 = this.web3Service.getWeb3();
        this.createForm();
    }

    private createForm() {
        this.datasetForm = this.fb.group({
            datasetName: ['', Validators.required],
            ipfsHash: ['', Validators.required],
            dsRandomKeyipfsHash: ['', Validators.required],
            datasetSpecs: ['', Validators.required],
            cost: ['', Validators.required]
        });
    }

    onSubmit() {
        let formModel = this.datasetForm.value;

        this.setTxStatus('Initiating transaction... (please wait)');
        this.datasetService
            .addDataset(
                // this.uploadedDatasetFile,
                formModel['datasetName'],
                formModel['ipfsHash'],
                formModel['dsRandomKeyipfsHash'],
                formModel['datasetSpecs'],
                this.web3.utils.toWei(formModel['cost'].toString(), 'ether')
            )
            .then(result => {
                if (!result) {
                    console.log('Transaction failed!');
                    this.setTxStatus('Transaction failed!');
                    this.loggerService.add('Failed to add dataset.');
                } else {
                    console.log('Transaction completed!');
                    this.setTxStatus('Transaction completed!');
                    this.loggerService.add('Dataset added successfully.');
                    this.reset();
                }
            })
            .catch(error => {
                console.log(error);
                this.setTxStatus('Transaction failed!');
                this.loggerService.add('Adding dataset failed.');
            });
    }

    setTxStatus(status) {
        this.txStatus = status;
    }

    getTxStatus() {
        return this.txStatus;
    }

    reset() {
        this.datasetForm.reset();
    }
}

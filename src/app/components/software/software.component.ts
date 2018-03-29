import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {SoftwareService} from '../../services/software.service';
import {LoggerService} from '../../services/logger.service';
import {Web3Service} from '../../util/web3.service';

@Component({
    selector: 'app-software',
    templateUrl: './software.component.html',
    styleUrls: ['./software.component.css']
})
export class SoftwareComponent implements OnInit {

    softwareForm: FormGroup;
    private txStatus: string;
    private web3: any;


    constructor(private fb: FormBuilder,
                private softwareService: SoftwareService,
                private web3Service: Web3Service,
                private loggerService: LoggerService) {
    }

    ngOnInit() {
        this.web3 = this.web3Service.getWeb3();
        this.createForm();
    }

    private createForm() {
        this.softwareForm = this.fb.group({
            id: '',
            filename: ['', Validators.required],
            ipfsHash: ['', Validators.required],
            paramType: ['', Validators.required],
            description: ['', Validators.required],
            cost: ['', Validators.required]
        });
    }

    onSubmit() {
        let formModel = this.softwareForm.value;

        this.setTxStatus('Initiating transaction... (please wait)');

        this.softwareService.addSoftware(
            formModel['filename'],
            formModel['ipfsHash'],
            formModel['paramType'],
            formModel['description'],
            this.web3.utils.toWei(formModel['cost'].toString(), 'ether'))
            .then(result => {
                if (!result) {
                    this.setTxStatus('Transaction failed!');
                    this.loggerService.add('Adding software failed.');
                } else {
                    console.log(result.tx);
                    this.setTxStatus('Transaction completed!');
                    this.loggerService.add('Software information added successfully - ' + result.tx);
                    this.reset();
                }
            })
            .catch(error => {
                console.log(error);
                this.setTxStatus('Transaction failed!');
                this.loggerService.add('Adding software failed.');
            });
    }

    reset() {
        this.softwareForm.reset();
    }

    setTxStatus(status) {
        this.txStatus = status;
    }

    getTxStatus() {
        return this.txStatus;
    }

}

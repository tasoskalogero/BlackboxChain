import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Web3Service} from '../../util/web3.service';
import {ContainerService} from '../../services/container.service';
import {LoggerService} from '../../services/logger.service';

@Component({
    selector: 'app-container',
    templateUrl: './container.component.html',
    styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit {
    @ViewChild('pubFileInput') pubKeyFileInputVariable: any; //used by ViewChile

    containerForm: FormGroup;

    private web3: any;
    private txStatus: any;

    constructor(
        private fb: FormBuilder,
        private web3Service: Web3Service,
        private containerService: ContainerService,
        private loggerService: LoggerService
    ) {
    }

    ngOnInit() {
        this.createForm();
        this.web3 = this.web3Service.getWeb3();
    }

    private createForm() {
        this.containerForm = this.fb.group({
            dockerID: ['', Validators.required],
            ipfsHash: ['', Validators.required],
            publicKey: [null, Validators.required], //store only filename
            containerSpecs: ['', Validators.required],
            cost: ['', Validators.required] //in Wei
        });
    }

    fileChange(event) {
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            let file: File = fileList[0];
            console.log(file);
            this.containerForm.controls['publicKey'].setValue(file);
        }
    }

    onSubmit() {
        let formModel = this.containerForm.value;
        this.setTxStatus('Initiating transaction... (please wait)');
        console.log(formModel['dockerID']);
        console.log(formModel['ipfsHash']);
        console.log(formModel['publicKey']);
        console.log(formModel['containerSpecs']);
        console.log(formModel['cost']);
        this.containerService
            .addContainer(
                formModel['dockerID'],
                formModel['ipfsHash'],
                formModel['publicKey'],
                formModel['containerSpecs'],
                this.web3.utils.toWei(formModel['cost'].toString(), 'ether')
            )
            .then(result => {
                if (!result) {
                    console.log('Transaction failed!');
                    this.setTxStatus('Transaction failed!');
                } else {
                    console.log('Transaction completed!');
                    this.setTxStatus('Transaction completed!');
                    this.loggerService.add('Container added successfully');
                    this.reset();
                }
            })
            .catch(error => {
                console.log(error);
                this.setTxStatus('Transaction failed!');
                this.loggerService.add('Adding container failed.');
            });
    }

    reset() {
        this.containerForm.reset();
        this.pubKeyFileInputVariable.nativeElement.value = '';
    }

    getTxStatus() {
        return this.txStatus;
    }

    setTxStatus(status) {
        this.txStatus = status;
    }
}

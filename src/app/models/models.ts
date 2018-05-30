export class Dataset {
    constructor(
        public ID: string,
        public datasetName: string,
        public datasetSpecification: string,
        public cost: number,
    ) {
    }
}

export class Container {
    constructor(
        public ID: string,
        public dockerID: string,
        public publicKey: string,
        public containerSpecification: string,
        public cost: number,
    ) {
    }
}

export class Software {
    constructor(
        public ID: string,
        public filename: string,
        public paramSpecs: string,
        public specification: string,
        public cost: number,
    ) {
    }
}

export class Result {
    constructor(
        public dataIpfsHash: string,
        public passwordIpfsHash: string,
    ) {}
}
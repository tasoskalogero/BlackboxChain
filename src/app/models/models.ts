export class Dataset {
  constructor(
    public ID: string,
    public datasetName: string,
    public datasetDescription: string,
    public cost: number,
    public bdbTxId: string,
    public owner: string

  ) {}
}

export class Container {
  constructor(
    public ID: string,
    public dockerID: string,
    public publicKey: string,
    public cost: number,
    public owner: string
  ) {}
}

export class Software {
  constructor(
    public ID: string,
    public filename: string,
    public ipfsHash: string,
    public paramType: string,
    public description: string,
    public cost: number,
    public owner: string
  ) {}
}

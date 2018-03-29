export class Dataset {
  constructor(
      public ID: string,
      public datasetName: string,
      public datasetDescription: string,
      public cost: number,
  ) { }
}


export class Container {
  constructor(
      public ID: string,
      public dockerID: string,
      public publicKey: string,
      public running: boolean,
      public cost: number
  ) {}
}



export class Software{

  constructor(
      public ID: string,
      public filename: string,
      public ipfsAddress: string,
      public paramType: string,
      public description: string,
  ) { }
}

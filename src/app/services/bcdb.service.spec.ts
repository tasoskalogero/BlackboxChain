import { TestBed, inject } from '@angular/core/testing';

import { BcdbService } from './bcdb.service';

describe('BcdbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BcdbService]
    });
  });

  it('should be created', inject([BcdbService], (service: BcdbService) => {
    expect(service).toBeTruthy();
  }));
});

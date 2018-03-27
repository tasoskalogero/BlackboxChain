import { TestBed, inject } from '@angular/core/testing';

import { BigchaindbService } from './bigchaindb.service';

describe('BigchaindbService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BigchaindbService]
    });
  });

  it('should be created', inject([BigchaindbService], (service: BigchaindbService) => {
    expect(service).toBeTruthy();
  }));
});

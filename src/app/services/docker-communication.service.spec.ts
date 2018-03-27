import { TestBed, inject } from '@angular/core/testing';

import { DockerCommunicationService } from './docker-communication.service';

describe('DockerCommunicationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DockerCommunicationService]
    });
  });

  it('should be created', inject([DockerCommunicationService], (service: DockerCommunicationService) => {
    expect(service).toBeTruthy();
  }));
});

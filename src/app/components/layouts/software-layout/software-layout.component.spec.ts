import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftwareLayoutComponent } from './software-layout.component';

describe('CodeSelectorComponent', () => {
  let component: SoftwareLayoutComponent;
  let fixture: ComponentFixture<SoftwareLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoftwareLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoftwareLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

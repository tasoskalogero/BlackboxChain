import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { ComputationLayoutComponent } from "./computation-layout.component";

describe("ComputationLayoutComponent", () => {
  let component: ComputationLayoutComponent;
  let fixture: ComponentFixture<ComputationLayoutComponent>;

  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        declarations: [ComputationLayoutComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ComputationLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});

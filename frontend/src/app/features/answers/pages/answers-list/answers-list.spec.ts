import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnswersList } from './answers-list';

describe('AnswersList', () => {
  let component: AnswersList;
  let fixture: ComponentFixture<AnswersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswersList],
    }).compileComponents();

    fixture = TestBed.createComponent(AnswersList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

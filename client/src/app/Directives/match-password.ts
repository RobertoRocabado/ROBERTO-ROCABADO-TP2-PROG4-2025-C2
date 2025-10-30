import { Directive, Input, OnDestroy } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, NgModel, ValidationErrors, Validator } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appMatchWith]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: MatchPasswordDirective, multi: true }],
})
export class MatchPasswordDirective implements Validator, OnDestroy {
  @Input('appMatchWith') otherModel?: NgModel;
  private sub?: Subscription;

  validate(control: AbstractControl): ValidationErrors | null {
    if (this.otherModel && !this.sub) {
      this.sub = this.otherModel.valueChanges?.subscribe(() => {
        control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      });
    }
    const val = control.value ?? '';
    const otherVal = this.otherModel?.value ?? '';
    if (!val) return null; 
    return val === otherVal ? null : { match: true };
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}

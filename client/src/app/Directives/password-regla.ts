import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appPasswordRegla]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: PasswordReglaDirective, multi: true }],
})
export class PasswordReglaDirective implements Validator {
  private regex = /^(?=.*\d)[A-Z][A-Za-z\d]{7,}$/;

  validate(control: AbstractControl): ValidationErrors | null {
    const v = control.value ?? '';
    if (!v) return null;
    return this.regex.test(v) ? null : { passwordRegla: true };
  }
}

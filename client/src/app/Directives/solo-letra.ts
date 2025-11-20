import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appSoloLetras]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: SoloLetrasDirective, multi: true }],
})
export class SoloLetrasDirective implements Validator {
  private regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

  validate(control: AbstractControl): ValidationErrors | null {
    const v = (control.value ?? '').trim();
    if (!v) return null; 
    return this.regex.test(v) ? null : { soloLetras: true };
  }
}

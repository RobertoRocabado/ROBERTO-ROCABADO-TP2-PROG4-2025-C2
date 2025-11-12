import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appAnioCuatro]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: AnioCuatroDirective,
      multi: true,
    },
  ],
})
export class AnioCuatroDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const v: string | null = control.value;

    if (!v) return null;

    const [year] = v.split('-');

    if (!/^\d{4}$/.test(year)) {
      return { anio4: true };
    }

    const y = Number(year);
    const current = new Date().getFullYear();
    if (y < 1900 || y > current) {
      return { anioRango: true };
    }

    return null;
  }
}

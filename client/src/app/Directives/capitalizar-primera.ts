import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgModel } from '@angular/forms';

@Directive({
  selector: '[appCapitalizarPrimera]',
  standalone: true,
})
export class CapitalizarPrimeraDirective {
  constructor(private el: ElementRef<HTMLInputElement>, @Optional() @Self() private ngModel: NgModel) {}

  @HostListener('input')
  onInput() {
    const input = this.el.nativeElement;
    const val = input.value ?? '';
    if (!val) return;

    const nuevo = val.charAt(0).toUpperCase() + val.slice(1);
    if (nuevo !== val) {
      const pos = input.selectionStart ?? nuevo.length;
      input.value = nuevo;
      if (this.ngModel?.control) {
        this.ngModel.control.setValue(nuevo);
      }
      requestAnimationFrame(() => input.setSelectionRange(pos, pos));
    }
  }
}

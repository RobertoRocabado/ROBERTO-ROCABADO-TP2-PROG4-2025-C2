import { Component, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';

// Directivas
import { SoloLetrasDirective } from '../../Directives/solo-letras';
import { CapitalizarPrimeraDirective } from '../../Directives/capitalizar-primera';
import { PasswordReglaDirective } from '../../Directives/password-regla';
import { MatchPasswordDirective } from '../../Directives/match-password';

type Rol = 'usuario' | 'administrador';

interface RegistroForm {
  nombre: string;
  apellido: string;
  correo: string;
  username: string;
  password: string;
  descripcion?: string;
  fechaNacimiento?: string;
  rol?: Rol;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SoloLetrasDirective,
    CapitalizarPrimeraDirective,
    PasswordReglaDirective,
    MatchPasswordDirective,
  ],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css'],
})

export class Registro {
  form: RegistroForm = {
    nombre: '',
    apellido: '',
    correo: '',
    username: '',
    password: '',
    rol: 'usuario',
  };

  confirmPassword = '';
  fotoFile: File | null = null;
  fotoPreview: string | null = null;
  fotoError = '';

  submitted = false;
  msgGeneral = '';
  msg = '';

  constructor(private auth: AuthService, private router: Router) {}

  @ViewChildren(NgModel) inputs!: QueryList<NgModel>;

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0];
    this.fotoError = '';

    if (!file) {
      this.fotoFile = null;
      this.fotoPreview = null;
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.fotoError = 'El archivo debe ser una imagen.';
      this.fotoFile = null;
      this.fotoPreview = null;
      return;
    }
    const maxMB = 3;
    if (file.size > maxMB * 1024 * 1024) {
      this.fotoError = `La imagen no debe superar ${maxMB}MB.`;
      this.fotoFile = null;
      this.fotoPreview = null;
      return;
    }

    this.fotoFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.fotoPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit(f: NgForm) {
    this.submitted = true;
    this.msgGeneral = '';
    this.msg = '';

    const formInvalido = f.invalid;
    const faltaFoto = !this.fotoFile;
    const hayFotoError = !!this.fotoError;
    const passNoCoincide = this.confirmPassword !== this.form.password;

    if (formInvalido || faltaFoto || hayFotoError || passNoCoincide) {
      this.msgGeneral =
        'Completá todos los espacios obligatorios (incluye subir una imagen de perfil).';
      return;
    }

    // Armo FormData (multipart/form-data)
    const fd = new FormData();
    fd.append('nombre', this.form.nombre.trim());
    fd.append('apellido', this.form.apellido.trim());
    fd.append('correo', this.form.correo.trim());
    fd.append('username', this.form.username.trim());
    fd.append('password', this.form.password);
    if (this.form.descripcion) fd.append('descripcion', this.form.descripcion);
    if (this.form.fechaNacimiento) fd.append('fechaNacimiento', this.form.fechaNacimiento);
    fd.append('rol', this.form.rol ?? 'usuario');

    if (this.fotoFile) {
      fd.append('foto', this.fotoFile, this.fotoFile.name);
    }

    this.auth.registro(fd).subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (err: any) => {
        console.error(err);

        this.msg = err.error?.message ?? 'Error en registro';

        const field = err.error?.field; // backend manda "correo" o "username"

        Swal.fire({
          icon: 'error',
          title: 'No pudimos crear tu cuenta',
          text: this.msg ?? 'Error inesperado',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Entendido',
        });
      },
    });
  }
}

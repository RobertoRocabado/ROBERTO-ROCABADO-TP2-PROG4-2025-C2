import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../service/usuarios.service';
import { RegistroFormulario } from '../../components/formulario-registro/formulario-registro';
import Swal from 'sweetalert2';
import { Estado } from '../../Pipe/Estado.pipe';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RegistroFormulario, Estado],
  styleUrls: ['./usuarios.css'],
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {
  usuarios: any[] = [];
  error = '';
  creando = false;
  usuarioActual: any = null;

  constructor(private auth: AuthService, private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.usuarioActual = this.auth.usuario;
    this.cargar();
  }

  cargar() {
    this.usuariosService.findAll().subscribe({
      next: (data) => (this.usuarios = data),
      error: () => {
        this.error = 'No se pudieron cargar los usuarios';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.error,
          confirmButtonColor: '#b1acac',
        });
      },
    });
  }

  abrirCrearUsuario() {
    this.creando = !this.creando;
  }

  crearDesdeFormulario(fd: any) {
    this.auth.registro(fd).subscribe({
      next: () => {
        this.creando = false;
        this.cargar();

        Swal.fire({
          icon: 'success',
          title: 'Usuario creado',
          text: `El usuario fue creado correctamente`,
          confirmButtonColor: '#b1acac',
        });
      },
      error: (err) => {
        console.error('Error creando usuario desde dashboard', err);
        console.error('cuerpo del error', err.error);

        if (err.status === 403) {
          this.error = 'Solo administradores pueden crear usuarios.';
        } else if (err.status === 409) {
          const field = err.error?.field || 'campo';
          this.error = `El ${field} ya está en uso.`;
        } else {
          this.error =
            err?.error?.message ||
            err?.error?.msg ||
            err?.message ||
            'Error al crear usuario';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al crear usuario',
          text: this.error,
          confirmButtonColor: '#b1acac',
        });
      },
    });
  }

  habilitar(u: any) {
    if (!u?._id) return;

    this.usuariosService.habilitar(u._id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Correo habilitado',
          html: `El correo <b>${u.correo}</b> fue habilitado`,
          confirmButtonColor: '#b1acac',
        });

        this.cargar();
      },
      error: (err) => {
        console.error('Error habilitando correo', err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo habilitar el correo',
          confirmButtonColor: '#b1acac',
        });
      },
    });
  }

  deshabilitar(u: any) {
    if (!u?._id) return;

    this.usuariosService.deshabilitar(u._id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'warning',
          title: 'Correo deshabilitado',
          html: `El correo <b>${u.correo}</b> fue deshabilitado`,
          confirmButtonColor: '#b1acac',
        });

        this.cargar();
      },
      error: (err) => {
        console.error('Error deshabilitando correo', err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo deshabilitar el correo',
          confirmButtonColor: '#b1acac',
        });
      },
    });
  }
}

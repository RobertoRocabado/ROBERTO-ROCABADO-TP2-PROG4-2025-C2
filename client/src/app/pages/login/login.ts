import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  form = { login: '', password: '' };
  msg = '';
  enviando = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    const login = this.form.login.trim();
    const password = this.form.password;

    if (!login || !password) return;

    this.enviando = true;
    

    this.auth.login(login, password).subscribe({
      next: (res) => {
        sessionStorage.setItem('loginOk', res.user.nombre);
        this.router.navigate(['/cargando']);
      },
      error: (e) => {
        this.enviando = false;
        console.error('Login error:', e?.status, e?.error);

        const msg = e?.error?.message || 'Credenciales inválidas';
        Swal.fire({
          icon: 'error',
          title: 'Error de autenticación',
          text: msg,
          confirmButtonColor: '#d33',
        });
      },
    });
  }
}

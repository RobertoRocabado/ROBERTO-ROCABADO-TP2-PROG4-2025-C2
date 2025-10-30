import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

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

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    const login = this.form.login.trim();
    const password = this.form.password;

    console.log('enviando login...', { login, password: password ? '***' : '' });

    this.auth.login(login, password).subscribe({
      next: (res) => {
        this.auth.setUsuario(res.user);
        this.router.navigateByUrl('/publicaciones');
      },
      error: (e) => {
        console.error('Login error:', e.status, e.error);
        this.msg = e?.error?.message || 'Credenciales inválidas';
      }
    });
  }

}

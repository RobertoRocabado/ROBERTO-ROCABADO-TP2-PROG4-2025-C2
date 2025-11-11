import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-cargando',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cargando.html',
  styleUrls: ['./cargando.css'],
})
export class Cargando implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.auth.autorizar().subscribe({
        next: (res) => {
          if (res.ok && res.user) {
            this.router.navigate(['/publicaciones']);
          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (err) => {
          this.router.navigate(['/login']);
        },
      });
    }, 1500);
  }
}

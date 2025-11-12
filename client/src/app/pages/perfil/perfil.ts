import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService, Usuario } from '../../service/auth.service';
import { PublicacionesApi, Publicacion, Page } from '../../service/publicaciones.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
  imports: [DatePipe],
})
export class MiPerfil implements OnInit {
  // Estado
  cargandoPerfil = signal<boolean>(true);
  cargandoPosts  = signal<boolean>(true);
  errorPerfil    = signal<string | null>(null);
  errorPosts     = signal<string | null>(null);

  // señales con los datos
  private _usuario = signal<Usuario | null>(null);
  private _publicaciones = signal<Publicacion[]>([]);

  constructor(
    private auth: AuthService,
    private publicacionesApi: PublicacionesApi,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPerfilYPosts();
  }

  usuario = () => this._usuario();
  publicaciones = () => this._publicaciones();

  get fotoPerfil(): string {
    return this._usuario()?.fotoUrl || '/assets/avatar-default.png';
  }

  private cargarPerfilYPosts(): void {
    this.cargandoPerfil.set(true);
    this.errorPerfil.set(null);

    this.auth.autorizar().subscribe({
      next: () => {
        const user = this.auth.usuario ?? null;
        this._usuario.set(user);
        this.cargandoPerfil.set(false);

        if (user?.correo) {
          this.cargarMisUltimasPublicaciones(user);
        } else {
          this.cargandoPosts.set(false);
          this.errorPosts.set('No se pudo determinar el usuario autenticado.');
        }
      },
      error: () => {
        this.cargandoPerfil.set(false);
        this.errorPerfil.set('No se pudo cargar el perfil. ¿Sesión expirada?');
        this.cargandoPosts.set(false);
      }
    });
  }

  private cargarMisUltimasPublicaciones(me: Usuario): void {
    this.cargandoPosts.set(true);
    this.errorPosts.set(null);

    this.publicacionesApi
      .listar({
        sortBy: 'fecha',
        limit: 4,
        page: 1,
        userCorreo: me.correo, 
      })
      .subscribe({
        next: (page: Page<Publicacion>) => {
          const items = page.items ?? [];
          const soloMias = items.filter(p =>
            p.usuario?.correo === me.correo
          );
          this._publicaciones.set(soloMias.slice(0, 3));
          this.cargandoPosts.set(false);
        },
        error: () => {
          this.errorPosts.set('No se pudieron cargar tus publicaciones.');
          this.cargandoPosts.set(false);
        }
      });
  }

  esMiPublicacion(pub: Publicacion): boolean {
    const me = this._usuario();
    if (!me) return false;
    return pub.usuario?.correo === me.correo;
  }

  trackById = (_: number, p: Publicacion) => p._id;

  volver(){
    this.router.navigate(['/publicaciones']);
  }
}

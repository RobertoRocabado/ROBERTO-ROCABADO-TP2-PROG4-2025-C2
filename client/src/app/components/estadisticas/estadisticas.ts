// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { EstadisticasService } from '../../service/estadisticas.service';
// import { NgChartsModule } from 'ng2-charts';
// import { ChartConfiguration, ChartType } from 'chart.js';

// @Component({
//   selector: 'app-estadisticas',
//   standalone: true,
//   imports: [CommonModule, NgChartsModule],
//   templateUrl: './estadisticas.html',
//   styleUrls: ['./estadisticas.css'],
// })
// export class Estadisticas implements OnInit {
//   // ============================
//   // RANGOS POR CADA GRÁFICO
//   // ============================

//   // Publicaciones por usuario (torta) -> por defecto SIN filtro (histórico)
//   rangoPubFechaInicio?: string;
//   rangoPubFechaFin?: string;

//   // Comentarios en el tiempo -> por defecto últimos 30 días
//   rangoComFechaInicio?: string;
//   rangoComFechaFin?: string;

//   // Comentarios por publicación -> por defecto últimos 30 días
//   rangoComPubFechaInicio?: string;
//   rangoComPubFechaFin?: string;

//   // ============================
//   // GRÁFICO TORTA: PUBLICACIONES POR USUARIO
//   // ============================

//   pieType: ChartType = 'pie';

//   pieChartData: ChartConfiguration['data'] = {
//     labels: [],
//     datasets: [
//       {
//         data: [],
//         backgroundColor: [],
//       } as any,
//     ],
//   };

//   // ============================
//   // GRÁFICO LÍNEAS: COMENTARIOS POR FECHA
//   // ============================

//   lineData: ChartConfiguration['data'] = {
//     labels: [],
//     datasets: [
//       {
//         data: [],
//         label: 'Comentarios',
//         fill: true,
//       },
//     ],
//   };

//   lineOptions: ChartConfiguration['options'] = {
//     responsive: true,
//   };

//   // ============================
//   // GRÁFICO BARRAS: COMENTARIOS POR PUBLICACIÓN
//   // ============================

//   barType: ChartType = 'bar';

//   barData: ChartConfiguration['data'] = {
//     labels: [],
//     datasets: [
//       {
//         data: [],
//         label: 'Comentarios por publicación',
//       },
//     ],
//   };

//   barOptions: ChartConfiguration['options'] = {
//     responsive: true,
//   };

//   cargando = false;

//   constructor(private estadisticasService: EstadisticasService) {}

//   ngOnInit(): void {
//     // Para la torta: sin filtro de fechas (histórico completo)
//     this.rangoPubFechaInicio = undefined;
//     this.rangoPubFechaFin = undefined;

//     // Para los otros dos gráficos: últimos 30 días
//     const hoy = new Date();
//     const hace30 = new Date();
//     hace30.setDate(hoy.getDate() - 30);

//     const inicioIso = hace30.toISOString();
//     const finIso = hoy.toISOString();

//     this.rangoComFechaInicio = inicioIso;
//     this.rangoComFechaFin = finIso;

//     this.rangoComPubFechaInicio = inicioIso;
//     this.rangoComPubFechaFin = finIso;

//     this.cargarTodo();
//   }

//   // ============================
//   // HELPERS
//   // ============================

//   // Convierte 'YYYY-MM-DD' a ISO o undefined
//   toIso(value: string): string | undefined {
//     if (!value) return undefined;
//     const d = new Date(value);
//     if (isNaN(d.getTime())) return undefined;
//     return d.toISOString();
//   }

//   // Genera una lista de colores para la torta
//   private generarColores(cantidad: number): string[] {
//     const base = [
//       '#ff6384', // rosa
//       '#36a2eb', // celeste
//       '#ffcd56', // amarillo
//       '#4bc0c0', // turquesa
//       '#9966ff', // violeta
//       '#ff9f40', // naranja
//     ];

//     const colores: string[] = [];
//     for (let i = 0; i < cantidad; i++) {
//       colores.push(base[i % base.length]);
//     }
//     return colores;
//   }

//   // ============================
//   // CARGA DE DATOS
//   // ============================

//   cargarTodo(): void {
//     this.cargarPublicacionesPorUsuario();
//     this.cargarComentariosPorFecha();
//     this.cargarComentariosPorPublicacion();
//   }

//   // 1) Torta: publicaciones por usuario
//   cargarPublicacionesPorUsuario(): void {
//     this.estadisticasService
//       .publicacionesPorUsuario(this.rangoPubFechaInicio, this.rangoPubFechaFin)
//       .subscribe({
//         next: (items: any[]) => {
//           // Backend devuelve:
//           // { cantidad: number, usuario: { username, nombre, apellido, correo } }

//           const labels = items.map((item) => {
//             const usuario = item.usuario || {};
//             const nombre = usuario.nombre || '';
//             const apellido = usuario.apellido || '';
//             const correo = usuario.correo || 'Usuario';

//             const nombreCompleto = `${nombre} ${apellido}`.trim();
//             return nombreCompleto || correo;
//           });

//           const data = items.map((item) => Number(item.cantidad || 0));
//           const colores = this.generarColores(data.length);

//           this.pieChartData = {
//             labels,
//             datasets: [
//               {
//                 data,
//                 backgroundColor: colores,
//               } as any,
//             ],
//           };
//         },
//         error: (err) => {
//           console.error('Error al cargar publicaciones por usuario', err);
//         },
//       });
//   }

//   // 2) Líneas: comentarios por fecha
//   cargarComentariosPorFecha(): void {
//     this.estadisticasService
//       .comentariosPorFecha(this.rangoComFechaInicio, this.rangoComFechaFin)
//       .subscribe({
//         next: (items: any[]) => {
//           // { fecha: string, cantidad: number }

//           const labels = items.map((item) => {
//             const fecha = item.fecha || item.createdAt;
//             return fecha
//               ? new Date(fecha).toLocaleDateString()
//               : 'Sin fecha';
//           });

//           const data = items.map((item) => Number(item.cantidad || 0));

//           this.lineData = {
//             labels,
//             datasets: [
//               {
//                 data,
//                 label: 'Comentarios',
//                 fill: true,
//               },
//             ],
//           };
//         },
//         error: (err) => {
//           console.error('Error al cargar comentarios por fecha', err);
//         },
//       });
//   }

//   // 3) Barras: comentarios por publicación
//   cargarComentariosPorPublicacion(): void {
//     this.estadisticasService
//       .comentariosPorPublicacion(
//         this.rangoComPubFechaInicio,
//         this.rangoComPubFechaFin,
//       )
//       .subscribe({
//         next: (items: any[]) => {
//           // { titulo: string, cantidad: number }

//           this.barData = {
//             labels: items.map(
//               (item) => item.titulo || 'Publicación sin título',
//             ),
//             datasets: [
//               {
//                 data: items.map((item) => Number(item.cantidad || 0)),
//                 label: 'Comentarios por publicación',
//               },
//             ],
//           };
//         },
//         error: (err) => {
//           console.error('Error al cargar comentarios por publicación', err);
//         },
//       });
//   }

//   // ============================
//   // MANEJADORES DE FILTROS (inputs date)
//   // ============================

//   // Publicaciones por usuario
//   onCambioPubFechaInicio(value: string): void {
//     this.rangoPubFechaInicio = this.toIso(value);
//     this.cargarPublicacionesPorUsuario();
//   }

//   onCambioPubFechaFin(value: string): void {
//     this.rangoPubFechaFin = this.toIso(value);
//     this.cargarPublicacionesPorUsuario();
//   }

//   // Comentarios por fecha
//   onCambioComFechaInicio(value: string): void {
//     this.rangoComFechaInicio = this.toIso(value);
//     this.cargarComentariosPorFecha();
//   }

//   onCambioComFechaFin(value: string): void {
//     this.rangoComFechaFin = this.toIso(value);
//     this.cargarComentariosPorFecha();
//   }

//   // Comentarios por publicación
//   onCambioComPubFechaInicio(value: string): void {
//     this.rangoComPubFechaInicio = this.toIso(value);
//     this.cargarComentariosPorPublicacion();
//   }

//   onCambioComPubFechaFin(value: string): void {
//     this.rangoComPubFechaFin = this.toIso(value);
//     this.cargarComentariosPorPublicacion();
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasService } from '../../service/estadisticas.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './estadisticas.html',
  styleUrls: ['./estadisticas.css'],
})
export class Estadisticas implements OnInit {
  // ============================
  // RANGOS POR CADA GRÁFICO
  // ============================

  // Publicaciones por usuario (torta) -> por defecto SIN filtro (histórico)
  rangoPubFechaInicio?: string;
  rangoPubFechaFin?: string;

  // Comentarios en el tiempo -> por defecto últimos 30 días
  rangoComFechaInicio?: string;
  rangoComFechaFin?: string;

  // Comentarios por publicación -> por defecto últimos 30 días
  rangoComPubFechaInicio?: string;
  rangoComPubFechaFin?: string;

  // ============================
  // GRÁFICO TORTA: PUBLICACIONES POR USUARIO
  // ============================

  pieType: ChartType = 'pie';

  pieChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      } as any,
    ],
  };

  // plugins que usará la torta (datalabels)
  pieChartPlugins = [DataLabelsPlugin];

  // opciones de la torta (texto dentro de cada porción)
  pieOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      datalabels: {
        color: '#ffffff',
        font: {
          weight: 'bold',
        },
        formatter: (value: number) => {
          // texto que se ve dentro de cada porción
          return value.toString();
        },
      },
    },
  };

  // total general de publicaciones (para mostrar al costado)
  totalPublicacionesPie = 0;

  // ============================
  // GRÁFICO LÍNEAS: COMENTARIOS POR FECHA
  // ============================

  lineData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Comentarios',
        fill: true,
      },
    ],
  };

  lineOptions: ChartConfiguration['options'] = {
    responsive: true,
  };

  // ============================
  // GRÁFICO BARRAS: COMENTARIOS POR PUBLICACIÓN
  // ============================

  barType: ChartType = 'bar';

  barData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Comentarios por publicación',
      },
    ],
  };

  barOptions: ChartConfiguration['options'] = {
    responsive: true,
  };

  cargando = false;

  constructor(private estadisticasService: EstadisticasService) {}

  ngOnInit(): void {
    // Para la torta: sin filtro de fechas (histórico completo)
    this.rangoPubFechaInicio = undefined;
    this.rangoPubFechaFin = undefined;

    // Para los otros dos gráficos: últimos 30 días
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);

    const inicioIso = hace30.toISOString();
    const finIso = hoy.toISOString();

    this.rangoComFechaInicio = inicioIso;
    this.rangoComFechaFin = finIso;

    this.rangoComPubFechaInicio = inicioIso;
    this.rangoComPubFechaFin = finIso;

    this.cargarTodo();
  }

  // ============================
  // HELPERS
  // ============================

  // Convierte 'YYYY-MM-DD' a ISO o undefined
  toIso(value: string): string | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  // Genera una lista de colores para la torta
  private generarColores(cantidad: number): string[] {
    const base = [
      '#ff6384', // rosa
      '#36a2eb', // celeste
      '#ffcd56', // amarillo
      '#4bc0c0', // turquesa
      '#9966ff', // violeta
      '#ff9f40', // naranja
    ];

    const colores: string[] = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(base[i % base.length]);
    }
    return colores;
  }

  // ============================
  // CARGA DE DATOS
  // ============================

  cargarTodo(): void {
    this.cargarPublicacionesPorUsuario();
    this.cargarComentariosPorFecha();
    this.cargarComentariosPorPublicacion();
  }

  // 1) Torta: publicaciones por usuario
  cargarPublicacionesPorUsuario(): void {
    this.estadisticasService
      .publicacionesPorUsuario(this.rangoPubFechaInicio, this.rangoPubFechaFin)
      .subscribe({
        next: (items: any[]) => {
          // Backend devuelve:
          // { cantidad: number, usuario: { username, nombre, apellido, correo } }

          const labels = items.map((item) => {
            const usuario = item.usuario || {};
            const nombre = usuario.nombre || '';
            const apellido = usuario.apellido || '';
            const correo = usuario.correo || 'Usuario';

            const nombreCompleto = `${nombre} ${apellido}`.trim();
            return nombreCompleto || correo;
          });

          const data = items.map((item) => Number(item.cantidad || 0));
          const colores = this.generarColores(data.length);

          // total general de publicaciones para este rango
          this.totalPublicacionesPie = data.reduce(
            (acc, val) => acc + (val || 0),
            0,
          );

          this.pieChartData = {
            labels,
            datasets: [
              {
                data,
                backgroundColor: colores,
              } as any,
            ],
          };
        },
        error: (err) => {
          console.error('Error al cargar publicaciones por usuario', err);
        },
      });
  }

  // 2) Líneas: comentarios por fecha
  cargarComentariosPorFecha(): void {
    this.estadisticasService
      .comentariosPorFecha(this.rangoComFechaInicio, this.rangoComFechaFin)
      .subscribe({
        next: (items: any[]) => {
          // { fecha: string, cantidad: number }

          const labels = items.map((item) => {
            const fecha = item.fecha || item.createdAt;
            return fecha
              ? new Date(fecha).toLocaleDateString()
              : 'Sin fecha';
          });

          const data = items.map((item) => Number(item.cantidad || 0));

          this.lineData = {
            labels,
            datasets: [
              {
                data,
                label: 'Comentarios',
                fill: true,
              },
            ],
          };
        },
        error: (err) => {
          console.error('Error al cargar comentarios por fecha', err);
        },
      });
  }

  // 3) Barras: comentarios por publicación
  cargarComentariosPorPublicacion(): void {
    this.estadisticasService
      .comentariosPorPublicacion(
        this.rangoComPubFechaInicio,
        this.rangoComPubFechaFin,
      )
      .subscribe({
        next: (items: any[]) => {
          // { titulo: string, cantidad: number }

          this.barData = {
            labels: items.map(
              (item) => item.titulo || 'Publicación sin título',
            ),
            datasets: [
              {
                data: items.map((item) => Number(item.cantidad || 0)),
                label: 'Comentarios por publicación',
              },
            ],
          };
        },
        error: (err) => {
          console.error('Error al cargar comentarios por publicación', err);
        },
      });
  }

  // ============================
  // MANEJADORES DE FILTROS (inputs date)
  // ============================

  // Publicaciones por usuario
  onCambioPubFechaInicio(value: string): void {
    this.rangoPubFechaInicio = this.toIso(value);
    this.cargarPublicacionesPorUsuario();
  }

  onCambioPubFechaFin(value: string): void {
    this.rangoPubFechaFin = this.toIso(value);
    this.cargarPublicacionesPorUsuario();
  }

  // Comentarios por fecha
  onCambioComFechaInicio(value: string): void {
    this.rangoComFechaInicio = this.toIso(value);
    this.cargarComentariosPorFecha();
  }

  onCambioComFechaFin(value: string): void {
    this.rangoComFechaFin = this.toIso(value);
    this.cargarComentariosPorFecha();
  }

  // Comentarios por publicación
  onCambioComPubFechaInicio(value: string): void {
    this.rangoComPubFechaInicio = this.toIso(value);
    this.cargarComentariosPorPublicacion();
  }

  onCambioComPubFechaFin(value: string): void {
    this.rangoComPubFechaFin = this.toIso(value);
    this.cargarComentariosPorPublicacion();
  }
}

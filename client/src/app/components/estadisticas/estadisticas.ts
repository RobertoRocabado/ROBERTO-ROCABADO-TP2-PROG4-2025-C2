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

  rangoPubFechaInicio?: string;
  rangoPubFechaFin?: string;

  rangoComFechaInicio?: string;
  rangoComFechaFin?: string;

  rangoComPubFechaInicio?: string;
  rangoComPubFechaFin?: string;

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

  pieChartPlugins = [DataLabelsPlugin];

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
          return value.toString();
        },
      },
    },
  };

  totalPublicacionesPie = 0;

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
    this.rangoPubFechaInicio = undefined;
    this.rangoPubFechaFin = undefined;

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

  toIso(value: string): string | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    if (isNaN(d.getTime())) return undefined;
    return d.toISOString();
  }

  private generarColores(cantidad: number): string[] {
    const base = [
      '#ff6384', 
      '#36a2eb', 
      '#ffcd56', 
      '#4bc0c0', 
      '#9966ff', 
      '#ff9f40', 
    ];

    const colores: string[] = [];
    for (let i = 0; i < cantidad; i++) {
      colores.push(base[i % base.length]);
    }
    return colores;
  }

  cargarTodo(): void {
    this.cargarPublicacionesPorUsuario();
    this.cargarComentariosPorFecha();
    this.cargarComentariosPorPublicacion();
  }

  cargarPublicacionesPorUsuario(): void {
    this.estadisticasService
      .publicacionesPorUsuario(this.rangoPubFechaInicio, this.rangoPubFechaFin)
      .subscribe({
        next: (items: any[]) => {
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

  cargarComentariosPorFecha(): void {
    this.estadisticasService
      .comentariosPorFecha(this.rangoComFechaInicio, this.rangoComFechaFin)
      .subscribe({
        next: (items: any[]) => {
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

  cargarComentariosPorPublicacion(): void {
    this.estadisticasService
      .comentariosPorPublicacion(
        this.rangoComPubFechaInicio,
        this.rangoComPubFechaFin,
      )
      .subscribe({
        next: (items: any[]) => {
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

  onCambioPubFechaInicio(value: string): void {
    this.rangoPubFechaInicio = this.toIso(value);
    this.cargarPublicacionesPorUsuario();
  }

  onCambioPubFechaFin(value: string): void {
    this.rangoPubFechaFin = this.toIso(value);
    this.cargarPublicacionesPorUsuario();
  }

  onCambioComFechaInicio(value: string): void {
    this.rangoComFechaInicio = this.toIso(value);
    this.cargarComentariosPorFecha();
  }

  onCambioComFechaFin(value: string): void {
    this.rangoComFechaFin = this.toIso(value);
    this.cargarComentariosPorFecha();
  }

  onCambioComPubFechaInicio(value: string): void {
    this.rangoComPubFechaInicio = this.toIso(value);
    this.cargarComentariosPorPublicacion();
  }

  onCambioComPubFechaFin(value: string): void {
    this.rangoComPubFechaFin = this.toIso(value);
    this.cargarComentariosPorPublicacion();
  }
}

// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Publicacion } from './entities/publicaciones.entity';
// import { RangoFechasDto } from './dto/rango-fechas.dto';

// @Injectable()
// export class EstadisticasService {
//   constructor(
//     @InjectModel(Publicacion.name)
//     private publicacionModel: Model<Publicacion>,
//   ) {}

//   private buildMatchFecha(dto: RangoFechasDto) {
//     if (!dto.fechaInicio && !dto.fechaFin) return {};

//     const rango: any = {};
//     if (dto.fechaInicio) rango.$gte = new Date(dto.fechaInicio);
//     if (dto.fechaFin) rango.$lte = new Date(dto.fechaFin);

//     return { createdAt: rango };
//   }

//   // 1) Cantidad de publicaciones por usuario (segun snapshot)
//   async publicacionesPorUsuario(dto: RangoFechasDto) {
//     const match = this.buildMatchFecha(dto);

//     const pipeline: any[] = [];

//     if (Object.keys(match).length > 0) pipeline.push({ $match: match });

//     pipeline.push(
//       {
//         $group: {
//           _id: '$usuario.username', // como tu snapshot incluye username
//           cantidad: { $sum: 1 },
//           usuario: { $first: '$usuario' },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           username: '$_id',
//           nombre: '$usuario.nombre',
//           apellido: '$usuario.apellido',
//           correo: '$usuario.correo',
//           cantidad: 1,
//         },
//       },
//       { $sort: { cantidad: -1 } },
//     );

//     return this.publicacionModel.aggregate(pipeline);
//   }

//   // 2) Cantidad total de comentarios por fecha
//   async comentariosPorFecha(dto: RangoFechasDto) {
//     const match = this.buildMatchFecha(dto);

//     const pipeline: any[] = [];

//     pipeline.push({ $unwind: '$comentarios' });

//     if (Object.keys(match).length > 0)
//       pipeline.push({
//         $match: {
//           'comentarios.createdAt': match.createdAt,
//         },
//       });

//     pipeline.push(
//       {
//         $group: {
//           _id: {
//             $dateToString: {
//               date: '$comentarios.createdAt',
//               format: '%Y-%m-%d',
//             },
//           },
//           cantidad: { $sum: 1 },
//         },
//       },
//       { $sort: { _id: 1 } },
//       {
//         $project: {
//           _id: 0,
//           fecha: '$_id',
//           cantidad: 1,
//         },
//       },
//     );

//     return this.publicacionModel.aggregate(pipeline);
//   }

//   // 3) Cantidad de comentarios por publicacion
//   async comentariosPorPublicacion(dto: RangoFechasDto) {
//     const match = this.buildMatchFecha(dto);

//     const pipeline: any[] = [];

//     pipeline.push({ $unwind: '$comentarios' });

//     if (Object.keys(match).length > 0)
//       pipeline.push({
//         $match: {
//           'comentarios.createdAt': match.createdAt,
//         },
//       });

//     pipeline.push(
//       {
//         $group: {
//           _id: '$_id',
//           titulo: { $first: '$titulo' },
//           cantidad: { $sum: 1 },
//         },
//       },
//       { $sort: { cantidad: -1 } },
//       {
//         $project: {
//           _id: 0,
//           publicacionId: '$_id',
//           titulo: 1,
//           cantidad: 1,
//         },
//       },
//     );

//     return this.publicacionModel.aggregate(pipeline);
//   }
// }

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './entities/publicaciones.entity';
import { RangoFechasDto } from './dto/rango-fechas.dto';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private publicacionModel: Model<Publicacion>,
  ) {}

  // Construye el filtro por rango de fechas en base a createdAt
  private buildMatchFecha(dto: RangoFechasDto) {
    if (!dto.fechaInicio && !dto.fechaFin) return {};

    const rango: any = {};
    if (dto.fechaInicio) rango.$gte = new Date(dto.fechaInicio);
    if (dto.fechaFin) rango.$lte = new Date(dto.fechaFin);

    return { createdAt: rango };
  }

  
  // async publicacionesPorUsuario(dto: RangoFechasDto) {
  //   const match = this.buildMatchFecha(dto);
  //   const pipeline: any[] = [];

  //   if (Object.keys(match).length > 0) {
  //     pipeline.push({ $match: match });
  //   }

  //   pipeline.push(
  //     {
  //       $group: {
  //         _id: '$usuario.username', // agrupamos por username del snapshot
  //         cantidad: { $sum: 1 },
  //         usuario: { $first: '$usuario' },
  //       },
  //     },
  //     {
  //       // devolvemos un objeto usuario para que el front lo consuma fácil
  //       $project: {
  //         _id: 0,
  //         cantidad: 1,
  //         usuario: {
  //           username: '$_id',
  //           nombre: '$usuario.nombre',
  //           apellido: '$usuario.apellido',
  //           correo: '$usuario.correo',
  //         },
  //       },
  //     },
  //     { $sort: { cantidad: -1 } },
  //   );

  //   return this.publicacionModel.aggregate(pipeline);
  // }

  // 2) Cantidad total de comentarios por fecha
  
  // 1) Cantidad de publicaciones por usuario (según snapshot)
async publicacionesPorUsuario(dto: RangoFechasDto) {
  const matchFecha = this.buildMatchFecha(dto);

  const pipeline: any[] = [];

  // siempre filtramos por que exista correo (para evitar agrupar todo en null)
  const matchBase: any = {
    'usuario.correo': { $exists: true, $ne: null },
  };

  if (Object.keys(matchFecha).length > 0) {
    pipeline.push({
      $match: {
        ...matchFecha,
        ...matchBase,
      },
    });
  } else {
    pipeline.push({ $match: matchBase });
  }

  pipeline.push(
    {
      $group: {
        // agrupamos por correo del snapshot
        _id: '$usuario.correo',
        cantidad: { $sum: 1 },
        usuario: { $first: '$usuario' },
      },
    },
    {
      $project: {
        _id: 0,
        cantidad: 1,
        usuario: {
          correo: '$_id',                // clave de agrupamiento
          nombre: '$usuario.nombre',
          apellido: '$usuario.apellido',
          username: '$usuario.username', // por si después lo completás
          _id: '$usuario._id',
        },
      },
    },
    { $sort: { cantidad: -1 } },
  );

  return this.publicacionModel.aggregate(pipeline);
}

  
  async comentariosPorFecha(dto: RangoFechasDto) {
    const match = this.buildMatchFecha(dto);
    const pipeline: any[] = [];

    // "Explota" el array de comentarios
    pipeline.push({ $unwind: '$comentarios' });

    if (Object.keys(match).length > 0) {
      pipeline.push({
        $match: {
          'comentarios.createdAt': match.createdAt,
        },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            $dateToString: {
              date: '$comentarios.createdAt',
              format: '%Y-%m-%d',
            },
          },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          fecha: '$_id',
          cantidad: 1,
        },
      },
    );

    return this.publicacionModel.aggregate(pipeline);
  }

  // 3) Cantidad de comentarios por publicación
  async comentariosPorPublicacion(dto: RangoFechasDto) {
    const match = this.buildMatchFecha(dto);
    const pipeline: any[] = [];

    pipeline.push({ $unwind: '$comentarios' });

    if (Object.keys(match).length > 0) {
      pipeline.push({
        $match: {
          'comentarios.createdAt': match.createdAt,
        },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: '$_id',
          titulo: { $first: '$titulo' },
          cantidad: { $sum: 1 },
        },
      },
      { $sort: { cantidad: -1 } },
      {
        $project: {
          _id: 0,
          publicacionId: '$_id',
          titulo: 1,
          cantidad: 1,
        },
      },
    );

    return this.publicacionModel.aggregate(pipeline);
  }
}

// // common/common.module.ts
// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';
// import { JwtAuthService } from '../../services/jwt.service';

// @Module({
//   imports: [
//     JwtModule.registerAsync({
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.get('auth.accessSecret'),
//         signOptions: {
//           expiresIn: configService.get('auth.accessExpiresIn', '15m'),
//         },
//       }),
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [JwtAuthService],
//   exports: [JwtAuthService, JwtModule], // Export both
// })
// export class CommonModule {}

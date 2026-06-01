import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { NfcModule } from './nfc/nfc.module';
import { PlacesModule } from './places/places.module';
import { RankingsModule } from './rankings/rankings.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { WorkoutRecordsModule } from './workout-records/workout-records.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    AuthModule,
    AdminModule,
    PlacesModule,
    NfcModule,
    TagsModule,
    UsersModule,
    RankingsModule,
    WorkoutRecordsModule,
    WorkoutSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

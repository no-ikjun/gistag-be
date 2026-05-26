import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { NfcModule } from './nfc/nfc.module';
import { PlacesModule } from './places/places.module';
import { TagsModule } from './tags/tags.module';
import { WorkoutRecordsModule } from './workout-records/workout-records.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    AuthModule,
    PlacesModule,
    NfcModule,
    TagsModule,
    WorkoutRecordsModule,
    WorkoutSessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

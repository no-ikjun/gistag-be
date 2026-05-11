import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { NfcModule } from './nfc/nfc.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
    PlacesModule,
    NfcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

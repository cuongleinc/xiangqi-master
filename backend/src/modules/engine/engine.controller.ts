import { Controller, Get } from '@nestjs/common';
import { EngineService } from './engine.service';

@Controller('engine')
export class EngineController {
  constructor(private readonly engineService: EngineService) {}

  @Get('status')
  getStatus() {
    return this.engineService.getHealth();
  }
}

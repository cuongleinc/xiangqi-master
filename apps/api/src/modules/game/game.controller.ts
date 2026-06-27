import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto, MakeMoveDto } from './dto/create-game.dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  async createGame(@Body() dto: CreateGameDto) {
    return this.gameService.createGame(dto.difficulty);
  }

  @Get(':id')
  async getGame(@Param('id', ParseUUIDPipe) id: string) {
    return this.gameService.getGame(id);
  }

  @Post(':id/move')
  async makeMove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MakeMoveDto,
  ) {
    return this.gameService.makeMove(id, dto.uci);
  }

  @Post(':id/hint')
  async getHint(@Param('id', ParseUUIDPipe) id: string) {
    return this.gameService.getHint(id);
  }

  @Get(':id/moves')
  async getGameMoves(@Param('id', ParseUUIDPipe) id: string) {
    return this.gameService.getGameMoves(id);
  }
}

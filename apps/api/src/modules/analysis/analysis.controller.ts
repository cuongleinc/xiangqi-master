import { Controller, Get, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('evaluate')
  async evaluate(@Body() dto: { fen: string }) {
    return this.analysisService.evaluatePosition(dto.fen);
  }

  @Post('best-move')
  async bestMove(@Body() dto: { fen: string; movetime?: number }) {
    return this.analysisService.getBestMove(dto.fen, dto.movetime);
  }

  @Get('review/:gameId')
  async getReview(@Param('gameId', ParseUUIDPipe) gameId: string) {
    return this.analysisService.generateGameReview(gameId);
  }
}

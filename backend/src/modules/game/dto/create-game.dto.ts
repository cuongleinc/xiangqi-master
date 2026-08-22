import { IsOptional, IsEnum, IsString, Length, Matches } from 'class-validator';

export class CreateGameDto {
  @IsOptional()
  @IsEnum(['easy', 'medium', 'hard', 'expert'])
  difficulty?: string = 'medium';

  @IsOptional()
  @IsEnum(['pvc', 'analysis'])
  matchType?: string = 'pvc';
}

export class MakeMoveDto {
  @IsString()
  @Length(4, 4)
  @Matches(/^[a-i][0-9][a-i][0-9]$/)
  uci!: string;
}

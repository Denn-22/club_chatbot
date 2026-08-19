import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AskDto } from './dto/ask.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('ask')
  @ApiOperation({
    summary: 'Tanya Komentator AI (proxy ke Ollama unismuh)',
  })
  ask(@Body() dto: AskDto) {
    return this.ai.ask(dto.question, dto.history);
  }
}

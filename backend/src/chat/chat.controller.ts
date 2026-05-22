import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { MediaService } from '../media/media.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly mediaService: MediaService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file ảnh');
    }
    const imageUrl = await this.mediaService.processChatImage(file);
    return { imageUrl };
  }

  @Post('conversations')
  async getOrCreateConversation(
    @CurrentUser('id') userId: string,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    return this.chatService.getOrCreateConversation(
      userId,
      createConversationDto.recipientId,
    );
  }

  @Get('conversations')
  async getConversations(@CurrentUser('id') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(
      conversationId,
      userId,
      page ? +page : undefined,
      limit ? +limit : undefined,
    );
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @CurrentUser('id') senderId: string,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(
      senderId,
      conversationId,
      sendMessageDto.content,
      sendMessageDto.imageUrl,
    );
  }
}

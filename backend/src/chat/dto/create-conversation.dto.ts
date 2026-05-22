import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsNotEmpty()
  @IsUUID()
  recipientId: string;
}

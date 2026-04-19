import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  mentioned_usernames?: string[];
}

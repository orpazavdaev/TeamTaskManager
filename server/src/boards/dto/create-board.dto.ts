import { IsString, IsOptional, IsArray } from "class-validator";

export class CreateBoardDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsArray()
  @IsOptional()
  members?: string[];
}


import { IsString, IsOptional, IsArray } from "class-validator";

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  members?: string[];
}

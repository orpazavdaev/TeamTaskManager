import { IsString, IsOptional, IsArray, IsBoolean } from "class-validator";

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  members?: string[];

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

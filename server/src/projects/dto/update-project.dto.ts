import { IsString, IsOptional, IsArray, IsBoolean } from "class-validator";

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  members?: string[];

  @IsString()
  @IsOptional()
  activeBoardId?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

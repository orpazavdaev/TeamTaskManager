import { IsString, IsOptional, IsArray } from "class-validator";

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
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle MongoDB connection errors
      if (
        error.name === "MongoServerError" ||
        error.message?.includes("Mongo")
      ) {
        throw new HttpException(
          "Database connection error. Please check your MongoDB connection.",
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      // Generic error
      throw new HttpException(
        error.message || "Registration failed. Please try again.",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }

      // Handle MongoDB connection errors
      if (
        error.name === "MongoServerError" ||
        error.message?.includes("Mongo")
      ) {
        throw new HttpException(
          "Database connection error. Please check your MongoDB connection.",
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }

      // Generic error
      throw new HttpException(
        error.message ||
          "Login failed. Please check your credentials and try again.",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get("users")
  async getUsers() {
    return this.authService.findAllUsers();
  }
}

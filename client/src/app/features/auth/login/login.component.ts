import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage = '';
  isLoading = false;
  returnUrl: string = '/projects';

  ngOnInit(): void {
    // Get returnUrl from query params, default to /projects
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params['returnUrl'] || '/projects';
      // Make sure returnUrl doesn't point to /boards
      if (this.returnUrl.startsWith('/boards')) {
        this.returnUrl = '/projects';
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate([this.returnUrl]);
        },
        error: (err) => {
          this.isLoading = false;

          // Better error messages
          if (err.status === 0) {
            this.errorMessage =
              'Cannot connect to server. Please check if the backend is running on http://localhost:3001';
          } else if (err.status === 401) {
            this.errorMessage =
              err.error?.message || 'Invalid email or password. Please try again.';
          } else if (err.status === 503) {
            this.errorMessage = 'Database connection error. Please check your MongoDB connection.';
          } else if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = `Login failed (${
              err.status || 'unknown error'
            }). Please check your connection and try again.`;
          }
        },
      });
    } else {
      this.errorMessage = 'Please fill in all fields correctly.';
    }
  }
}

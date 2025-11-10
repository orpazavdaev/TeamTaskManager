import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  user = this.authService.user;
  isDarkMode = this.themeService.isDarkMode;
  showUserMenu = signal(false);

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleUserMenu(): void {
    this.showUserMenu.update((value) => !value);
  }

  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  navigateToProfile(): void {
    this.closeUserMenu();
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }

  navigateHome(): void {
    this.router.navigate(['/projects']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.closeUserMenu();
    }
  }
}
